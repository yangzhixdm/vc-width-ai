const { Game, Player, Action } = require('../models');
const { v4: uuidv4 } = require('uuid');

class GameService {
  constructor() {
    this.cardSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  }

  // Create a new game
  async createGame(smallBlind = 10, bigBlind = 20) {
    const game = await Game.create({
      smallBlind,
      bigBlind,
      currentPot: 0
    });
    return game;
  }

  // Add player to game
  async addPlayer(gameId, playerData) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const players = await Player.findAll({ where: { gameId } });
    const position = players.length;

    const player = await Player.create({
      gameId,
      position,
      ...playerData
    });

    return player;
  }

  // Start the game
  async startGame(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    // Set up positions and roles
    await this.setupPositions(gameId, game.players);

    // Deal hole cards
    await this.dealHoleCards(gameId);

    // Post blinds
    await this.postBlinds(gameId);

    // Update game status
    await game.update({ status: 'active' });

    return game;
  }

  // Set up player positions and roles
  async setupPositions(gameId, players) {
    const positions = ['button', 'sb', 'bb', 'utg', 'utg+1', 'cutoff'];
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const role = positions[i] || 'regular';
      
      await player.update({
        position: i,
        role: role
      });
    }
  }

  // Get next player to act
  async getNextPlayer(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const activePlayers = game.players
      .filter(p => p.isActive && !p.isFolded && p.chips > 0)
      .sort((a, b) => a.position - b.position);

    if (activePlayers.length === 0) {
      return null;
    }

    // If no current player set, start with first player after BB
    if (!game.currentPlayerId) {
      const bbPlayer = activePlayers.find(p => p.role === 'bb');
      if (bbPlayer) {
        const bbIndex = activePlayers.findIndex(p => p.id === bbPlayer.id);
        const nextPlayerIndex = (bbIndex + 1) % activePlayers.length;
        const firstPlayer = activePlayers[nextPlayerIndex];
        await game.update({ currentPlayerId: firstPlayer.id });
        return firstPlayer;
      } else {
        // Fallback to first player if no BB found
        const firstPlayer = activePlayers[0];
        await game.update({ currentPlayerId: firstPlayer.id });
        return firstPlayer;
      }
    }

    // Find current player index
    const currentIndex = activePlayers.findIndex(p => p.id === game.currentPlayerId);
    
    // If current player not found or is last, start from beginning
    if (currentIndex === -1 || currentIndex === activePlayers.length - 1) {
      const nextPlayer = activePlayers[0];
      await game.update({ currentPlayerId: nextPlayer.id });
      return nextPlayer;
    }

    // Move to next player
    const nextPlayer = activePlayers[currentIndex + 1];
    await game.update({ currentPlayerId: nextPlayer.id });
    return nextPlayer;
  }

  // Set current player
  async setCurrentPlayer(gameId, playerId) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    await game.update({ currentPlayerId: playerId });
    return game;
  }

  // Update player chips
  async updatePlayerChips(gameId, playerId, chips) {
    const player = await Player.findOne({
      where: { id: playerId, gameId }
    });

    if (!player) {
      throw new Error('Player not found');
    }

    await player.update({ chips });
    return player;
  }

  // Deal hole cards to all players
  async dealHoleCards(gameId) {
    const players = await Player.findAll({ where: { gameId, isActive: true } });
    const deck = this.createDeck();
    this.shuffleDeck(deck);

    for (const player of players) {
      const holeCards = [deck.pop(), deck.pop()];
      await player.update({ holeCards });
    }
  }

  // Post small and big blinds
  async postBlinds(gameId) {
    const players = await Player.findAll({ 
      where: { gameId, isActive: true },
      order: [['position', 'ASC']]
    });

    const sbPlayer = players.find(p => p.role === 'sb');
    const bbPlayer = players.find(p => p.role === 'bb');

    if (sbPlayer) {
      await this.makeAction(gameId, sbPlayer.id, 'call', 10, 'preflop');
    }

    if (bbPlayer) {
      await this.makeAction(gameId, bbPlayer.id, 'call', 20, 'preflop');
    }

    // 设置第一个行动的玩家（BB之后的那一位）
    const game = await Game.findByPk(gameId);
    if (bbPlayer) {
      // 找到BB玩家的位置，下一个玩家就是第一个行动的
      const bbIndex = players.findIndex(p => p.id === bbPlayer.id);
      const nextPlayerIndex = (bbIndex + 1) % players.length;
      const firstToAct = players[nextPlayerIndex];
      
      if (firstToAct) {
        await game.update({ currentPlayerId: firstToAct.id });
      }
    }
  }

  // Make a player action
  async makeAction(gameId, playerId, actionType, amount = 0, round) {
    const game = await Game.findByPk(gameId);
    const player = await Player.findByPk(playerId);

    if (!game || !player) {
      throw new Error('Game or player not found');
    }

    // Update player's current bet and chips
    const totalBet = player.currentBet + amount;
    await player.update({
      currentBet: totalBet,
      chips: Math.max(0, player.chips - amount)
    });

    // Update pot
    await game.update({
      currentPot: game.currentPot + amount
    });

    // Record action
    const action = await Action.create({
      gameId,
      playerId,
      round: round || game.currentRound,
      actionType,
      amount,
      potSize: game.currentPot,
      position: player.position,
      holeCards: player.holeCards,
      communityCards: game.communityCards
    });

    // Auto-advance to next player after action
    const nextPlayer = await this.getNextPlayer(gameId);

    return {
      action,
      nextPlayer: nextPlayer ? {
        id: nextPlayer.id,
        name: nextPlayer.name,
        isHuman: nextPlayer.isHuman
      } : null
    };
  }

  // Deal community cards
  async dealCommunityCards(gameId, round) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const deck = this.createDeck();
    this.shuffleDeck(deck);

    // Remove cards already dealt to players
    const players = await Player.findAll({ where: { gameId } });
    const usedCards = [];
    players.forEach(player => {
      usedCards.push(...player.holeCards);
    });
    usedCards.push(...game.communityCards);

    const availableDeck = deck.filter(card => 
      !usedCards.some(used => used.suit === card.suit && used.value === card.value)
    );

    let cardsToDeal = 0;
    switch (round) {
      case 'flop':
        cardsToDeal = 3;
        break;
      case 'turn':
      case 'river':
        cardsToDeal = 1;
        break;
    }

    const newCards = availableDeck.slice(0, cardsToDeal);
    const updatedCommunityCards = [...game.communityCards, ...newCards];

    await game.update({
      communityCards: updatedCommunityCards,
      currentRound: round
    });

    return newCards;
  }

  // Create a standard 52-card deck
  createDeck() {
    const deck = [];
    for (const suit of this.cardSuits) {
      for (const value of this.cardValues) {
        deck.push({ suit, value });
      }
    }
    return deck;
  }

  // Shuffle deck using Fisher-Yates algorithm
  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  // Set player hole cards
  async setPlayerHoleCards(gameId, playerId, holeCards) {
    const player = await Player.findOne({
      where: { id: playerId, gameId }
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Validate hole cards
    if (!Array.isArray(holeCards) || holeCards.length !== 2) {
      throw new Error('Must provide exactly 2 hole cards');
    }

    // Check for duplicate cards
    const usedCards = await this.getAllUsedCards(gameId);
    const newCards = holeCards.filter(card => 
      !usedCards.some(used => used.suit === card.suit && used.value === card.value)
    );

    if (newCards.length !== holeCards.length) {
      throw new Error('Some cards are already in use');
    }

    await player.update({ holeCards });
    return player;
  }

  // Set community cards manually
  async setCommunityCards(gameId, cards, round) {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Validate cards based on round
    const expectedCount = this.getExpectedCardCount(round);
    if (!Array.isArray(cards) || cards.length !== expectedCount) {
      throw new Error(`Must provide exactly ${expectedCount} cards for ${round}`);
    }

    // Check for duplicate cards
    const usedCards = await this.getAllUsedCards(gameId);
    const newCards = cards.filter(card => 
      !usedCards.some(used => used.suit === card.suit && used.value === card.value)
    );

    if (newCards.length !== cards.length) {
      throw new Error('Some cards are already in use');
    }

    // Update community cards
    const updatedCommunityCards = [...(game.communityCards || []), ...cards];
    await game.update({
      communityCards: updatedCommunityCards,
      currentRound: round
    });

    return game;
  }

  // Get expected card count for each round
  getExpectedCardCount(round) {
    switch (round) {
      case 'flop': return 3;
      case 'turn': return 1;
      case 'river': return 1;
      default: return 0;
    }
  }

  // Get all used cards in the game
  async getAllUsedCards(gameId) {
    const usedCards = [];

    // Get all players' hole cards
    const players = await Player.findAll({ where: { gameId } });
    players.forEach(player => {
      if (player.holeCards) {
        usedCards.push(...player.holeCards);
      }
    });

    // Get community cards
    const game = await Game.findByPk(gameId);
    if (game && game.communityCards) {
      usedCards.push(...game.communityCards);
    }

    return usedCards;
  }

  // Settle chips and determine winner
  async settleChips(gameId, winnerId) {
    const game = await Game.findByPk(gameId, {
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const winner = game.players.find(p => p.id === winnerId);
    if (!winner) {
      throw new Error('Winner not found');
    }

    // Award pot to winner
    const potAmount = game.currentPot;
    await winner.update({
      chips: winner.chips + potAmount
    });

    // Reset all players' current bets
    await Promise.all(game.players.map(player => 
      player.update({ currentBet: 0 })
    ));

    // Update game state
    await game.update({
      status: 'completed',
      winner: winnerId,
      currentPot: 0,
      currentBet: 0,
      currentRound: 'showdown'
    });

    return {
      winner: {
        id: winner.id,
        name: winner.name,
        chipsWon: potAmount,
        newChipCount: winner.chips + potAmount
      },
      potAmount,
      gameStatus: 'completed'
    };
  }

  // End current hand and prepare for next hand
  async endHand(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Check if game should continue (at least 2 players with chips)
    const activePlayers = game.players.filter(p => p.chips > 0);
    
    if (activePlayers.length < 2) {
      // Game ends - not enough players
      await game.update({
        status: 'completed',
        currentPot: 0,
        currentBet: 0,
        currentRound: 'showdown'
      });
      
      return {
        game,
        gameEnded: true,
        reason: 'Not enough players with chips'
      };
    }

    // Reset game state for next hand
    await game.update({
      status: 'active', // Keep game active for next hand
      currentPot: 0,
      currentBet: 0,
      currentRound: 'preflop',
      communityCards: [],
      winner: null
    });

    // Reset all players for next hand
    await Promise.all(game.players.map(player => 
      player.update({
        currentBet: 0,
        holeCards: [],
        isFolded: false,
        isAllIn: false,
        isActive: player.chips > 0 // Only keep active if they have chips
      })
    ));

    // Move dealer button and setup positions for next hand
    const playersWithChips = game.players.filter(p => p.chips > 0);
    if (playersWithChips.length > 1) {
      await this.setupPositions(gameId, playersWithChips);
      
      // Post blinds for next hand
      await this.postBlinds(gameId);
      
      // Deal new hole cards
      await this.dealHoleCards(gameId);
    }

    return {
      game,
      gameEnded: false,
      activePlayers: playersWithChips.length
    };
  }

  // Get game state for client
  async getGameState(gameId) {
    const game = await Game.findByPk(gameId, {
      include: [
        { 
          model: Player, 
          as: 'players',
          include: [{ model: Action, as: 'actions' }]
        },
        { model: Action, as: 'actions' }
      ]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    return {
      game: {
        id: game.id,
        status: game.status,
        smallBlind: game.smallBlind,
        bigBlind: game.bigBlind,
        currentPot: game.currentPot,
        currentBet: game.currentBet,
        currentRound: game.currentRound,
        dealerPosition: game.dealerPosition,
        communityCards: game.communityCards,
        winner: game.winner,
        currentPlayerId: game.currentPlayerId
      },
      players: game.players.map(player => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        position: player.position,
        role: player.role,
        chips: player.chips,
        currentBet: player.currentBet,
        holeCards: player.holeCards,
        isActive: player.isActive,
        isHuman: player.isHuman,
        isFolded: player.isFolded,
        isAllIn: player.isAllIn
      })),
      actions: game.actions.map(action => ({
        id: action.id,
        playerId: action.playerId,
        round: action.round,
        actionType: action.actionType,
        amount: action.amount,
        potSize: action.potSize,
        position: action.position,
        isAIRecommended: action.isAIRecommended,
        createdAt: action.createdAt
      }))
    };
  }
}

module.exports = new GameService();
