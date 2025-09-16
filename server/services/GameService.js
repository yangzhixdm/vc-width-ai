const { Game, Player, Action } = require('../models');
const { v4: uuidv4 } = require('uuid');
const AIService = require('./AIService');

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
    const game = await Game.findOne({ where: { gameId } });
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
    const game = await Game.findOne({ 
      where: { gameId },
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    // Set up positions and roles
    await this.setupPositions(game, game.players);

    // Deal hole cards
    await this.dealHoleCards(gameId);

    // Post blinds
    await this.postBlinds(gameId);

    // Update game status
    await game.update({ status: 'active' });

    return game;
  }

  // Set up player positions and roles
  async setupPositions(game, players) {
    const positions = ['button', 'sb', 'bb', 'utg', 'utg+1', 'utg+2', 'cutoff'];
    
    // Start from dealer position
    const dealerPosition = game.dealerPosition || 0;
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const roleIndex = (i + dealerPosition) % players.length;
      const role = positions[roleIndex] || 'unset';
      
      await player.update({
        position: i,
        role: role,
        game_name: game.name
      });
    }
  }

  // Get next player to act
  async getNextPlayer(gameId) {
    const game = await Game.findOne({ 
      where: { gameId },
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
        const bbIndex = activePlayers.findIndex(p => p.playerId === bbPlayer.playerId);
        const nextPlayerIndex = (bbIndex + 1) % activePlayers.length;
        const firstPlayer = activePlayers[nextPlayerIndex];
        await game.update({ currentPlayerId: firstPlayer.playerId });
        return firstPlayer;
      } else {
        // Fallback to first player if no BB found
        const firstPlayer = activePlayers[0];
        await game.update({ currentPlayerId: firstPlayer.playerId });
        return firstPlayer;
      }
    }

    // Find current player index
    const currentIndex = activePlayers.findIndex(p => p.playerId === game.currentPlayerId);
    
    // If current player not found or is last, start from beginning
    if (currentIndex === -1 || currentIndex === activePlayers.length - 1) {
      const nextPlayer = activePlayers[0];
      await game.update({ currentPlayerId: nextPlayer.playerId });
      return nextPlayer;
    }

    // Move to next player
    const nextPlayer = activePlayers[currentIndex + 1];
    await game.update({ currentPlayerId: nextPlayer.playerId });
    return nextPlayer;
  }

  // Get first player for new betting round (starts from small blind position)
  async getFirstPlayerForNewRound(gameId) {
    const game = await Game.findOne({ 
      where: { gameId },
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

    // Find small blind player position
    const sbPlayer = activePlayers.find(p => p.role === 'sb');
    if (sbPlayer) {
      // Start from small blind position and find first active player
      const sbIndex = activePlayers.findIndex(p => p.playerId === sbPlayer.playerId);
      
      // Look for first active player starting from small blind position
      for (let i = 0; i < activePlayers.length; i++) {
        const playerIndex = (sbIndex + i) % activePlayers.length;
        const player = activePlayers[playerIndex];
        if (player.isActive && !player.isFolded && player.chips > 0) {
          await game.update({ currentPlayerId: player.playerId });
          return player;
        }
      }
    }
    
    // If no small blind found or no active player found, start from first active player
    const firstPlayer = activePlayers[0];
    await game.update({ currentPlayerId: firstPlayer.playerId });
    return firstPlayer;
  }

  // Set current player
  async setCurrentPlayer(gameId, playerId) {
    const game = await Game.findOne({ where: { gameId } });
    if (!game) {
      throw new Error('Game not found');
    }

    await game.update({ currentPlayerId: playerId });
    return game;
  }

  // Update player chips
  async updatePlayerChips(gameId, playerId, chips) {
    const player = await Player.findOne({
      where: { playerId: playerId, gameId }
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

  // Post small and big blinds,游戏开始前的初始行为, 小盲注和大盲注投注
  async postBlinds(gameId) {
    const players = await Player.findAll({ 
      where: { gameId, isActive: true },
      order: [['position', 'ASC']]
    });

    const sbPlayer = players.find(p => p.role === 'sb');
    const bbPlayer = players.find(p => p.role === 'bb');
    
    const game = await Game.findOne({ where: { gameId } });
    
    if (sbPlayer) {
      // 小盲注投注，但不标记为已行动（因为还需要等待其他玩家行动）
      await sbPlayer.update({
        currentBet: game.smallBlind,
        chips: sbPlayer.chips - game.smallBlind
      });
    }

    if (bbPlayer) {
      // 大盲注投注，但不标记为已行动（因为还需要等待其他玩家行动）
      await bbPlayer.update({
        currentBet: game.bigBlind,
        chips: bbPlayer.chips - game.bigBlind
      });
    }

    // 更新奖池和当前下注
    const totalBlinds = (sbPlayer ? game.smallBlind : 0) + (bbPlayer ? game.bigBlind : 0);
    await game.update({ 
      currentPot: totalBlinds,
      currentBet: game.bigBlind  // 设置当前下注为大盲注金额, 初始为大盲注金额, 后续会根据玩家下注情况更新
    });

    // 设置第一个行动的玩家（BB之后的那一位）
    if (bbPlayer) {
      // 找到BB玩家的位置，下一个玩家就是第一个行动的
      const bbIndex = players.findIndex(p => p.playerId === bbPlayer.playerId);
      const nextPlayerIndex = (bbIndex + 1) % players.length;
      const firstToAct = players[nextPlayerIndex];
      
      if (firstToAct) {
        await game.update({ currentPlayerId: firstToAct.playerId });
      }
    }
  }

  // Make a player action
  async makeAction(gameId, playerId, actionType, amount = 0, round) {
    const game = await Game.findOne({ where: { gameId } });
    const player = await Player.findOne({ where: { playerId } });

    if (!game || !player) {
      throw new Error('Game or player not found');
    }

    // Handle different action types
    let updatedPlayer = { ...player.dataValues };
    
    if (actionType === 'fold') {
      await player.update({ isFolded: true });
      updatedPlayer.isFolded = true;
    } else if (actionType === 'allin') {
      const allInAmount = player.chips;
      await player.update({
        currentBet: player.currentBet + allInAmount,
        chips: 0,
        isAllIn: true
      });
      updatedPlayer.currentBet = player.currentBet + allInAmount;
      updatedPlayer.chips = 0;
      updatedPlayer.isAllIn = true;
      amount = allInAmount;
    } else {
      // Update player's current bet and chips
      const totalBet = player.currentBet + amount;
      await player.update({
        currentBet: totalBet,
        chips: Math.max(0, player.chips - amount)
      });
      updatedPlayer.currentBet = totalBet;
      updatedPlayer.chips = Math.max(0, player.chips - amount);
    }

    // Mark player as having acted this round
    await player.update({ hasActedThisRound: true });

    // Update pot and current bet
    const newPot = game.currentPot + amount;
    let newCurrentBet = game.currentBet;
    
    // 如果是加注或全下，更新当前下注金额
    if (actionType === 'raise' || actionType === 'allin') {
      newCurrentBet = Math.max(game.currentBet, updatedPlayer.currentBet);
    }
    
    await game.update({
      currentPot: newPot,
      currentBet: newCurrentBet
    });

    // Record action
    const action = await Action.create({
      gameId,
      handNumber: game.handNumber,
      playerId,
      round: round || game.currentRound,
      actionType,
      amount,
      potSize: game.currentPot,
      position: player.position,
      holeCards: player.holeCards,
      communityCards: game.communityCards
    });

    // Check if betting round is complete
    const isRoundComplete = await this.isBettingRoundComplete(gameId);
    let nextRound = null;
    let nextPlayer = null;
    let gameContinued = false;
    let handNumber = game.handNumber;

    if (isRoundComplete) {
      // Advance to next round
      const advanceResult = await this.advanceToNextRound(gameId);
      
      // Handle different return types
      if (typeof advanceResult === 'object' && advanceResult.round) {
        // Showdown case - returns { round, showdownResult }
        nextRound = advanceResult.round;
        if (advanceResult.showdownResult) {
          gameContinued = advanceResult.showdownResult.gameContinued || false;
          handNumber = advanceResult.showdownResult.handNumber || game.handNumber;
        }
      } else {
        // Regular round advancement
        nextRound = advanceResult;
        // If not showdown, get first player for next round (starts from small blind)
        if (nextRound !== 'showdown') {
          nextPlayer = await this.getFirstPlayerForNewRound(gameId);
        }
      }
    } else {
      // Get next player in current round
      nextPlayer = await this.getNextPlayer(gameId);
    }

    return {
      action,
      nextPlayer: nextPlayer ? {
        id: nextPlayer.playerId,
        name: nextPlayer.name,
        isHuman: nextPlayer.isHuman
      } : null,
      roundComplete: isRoundComplete,
      nextRound: nextRound,
      gameContinued: gameContinued,
      handNumber: handNumber
    };
  }

  // Check if betting round is complete
  async isBettingRoundComplete(gameId) {
    const players = await Player.findAll({ 
      where: { gameId, isActive: true },
      order: [['position', 'ASC']]
    });

    const activePlayers = players.filter(p => !p.isFolded && p.chips > 0);
    
    // If only one player left, round is complete
    if (activePlayers.length <= 1) {
      console.log('Only one player left, round complete');
      return true;
    }

    // Check if all players have acted and bets are equal
    const maxBet = Math.max(...activePlayers.map(p => p.currentBet));
    const playersWithMaxBet = activePlayers.filter(p => p.currentBet === maxBet);
    const playersWhoActed = activePlayers.filter(p => p.hasActedThisRound);

    console.log('Betting round check:', {
      activePlayers: activePlayers.length,
      playersWhoActed: playersWhoActed.length,
      maxBet,
      playersWithMaxBet: playersWithMaxBet.length,
      allActed: playersWhoActed.length === activePlayers.length,
      allEqualBets: playersWithMaxBet.length === activePlayers.length,
      playerDetails: activePlayers.map(p => ({
        name: p.name,
        currentBet: p.currentBet,
        hasActed: p.hasActedThisRound,
        chips: p.chips
      }))
    });

    // Special case: if all players have the same bet (including 0), round is complete
    if (activePlayers.length > 0 && activePlayers.every(p => p.currentBet === maxBet)) {
      // Check if all players have acted OR if this is the first round and all have equal bets
      const allActed = playersWhoActed.length === activePlayers.length;
      const allEqualBets = playersWithMaxBet.length === activePlayers.length;
      
      console.log('Round completion check:', { allActed, allEqualBets });
      
      if (allActed && allEqualBets) {
        console.log('Round is complete!');
        return true;
      }
    }

    return false;
  }

  // Advance to next betting round
  async advanceToNextRound(gameId) {
    const game = await Game.findOne({ where: { gameId } });
    if (!game) {
      throw new Error('Game not found');
    }

    const currentRound = game.currentRound;
    let nextRound;

    console.log(`Advancing from ${currentRound} to next round`);

    // Reset player states for new round first
    await this.resetPlayerStatesForNewRound(gameId);

    switch (currentRound) {
      case 'preflop':
        nextRound = 'flop';
        // Deal flop (3 cards)
        await this.dealCommunityCards(gameId, 3);
        break;
      case 'flop':
        nextRound = 'turn';
        // Deal turn (1 card)
        await this.dealCommunityCards(gameId, 1);
        break;
      case 'turn':
        nextRound = 'river';
        // Deal river (1 card)
        await this.dealCommunityCards(gameId, 1);
        break;
      case 'river':
        nextRound = 'showdown';
        // Handle showdown after river
        const showdownResult = await this.handleShowdown(gameId);
        // Return the showdown result along with the round
        return { round: nextRound, showdownResult };
      default:
        nextRound = 'showdown';
    }

    // Update game (only for non-showdown rounds)
    await game.update({ 
      currentRound: nextRound,
      currentBet: 0
    });

    return nextRound;
  }

  // Deal community cards
  async dealCommunityCards(gameId, count) {
    const game = await Game.findOne({ where: { gameId } });
    if (!game) {
      throw new Error('Game not found');
    }

    // Get used cards
    const usedCards = await this.getUsedCards(gameId);
    
    // Get available cards
    const availableCards = this.getAvailableCards(usedCards);
    
    // Shuffle available cards
    this.shuffleDeck(availableCards);
    
    // Deal cards
    const newCards = availableCards.slice(0, count);
    const currentCommunityCards = game.communityCards || [];
    const updatedCommunityCards = [...currentCommunityCards, ...newCards];

    await game.update({ communityCards: updatedCommunityCards });
    return newCards;
  }

  // Get used cards from all players and community
  async getUsedCards(gameId) {
    const players = await Player.findAll({ where: { gameId } });
    const game = await Game.findOne({ where: { gameId } });
    
    const usedCards = [];
    
    // Collect hole cards
    players.forEach(player => {
      if (player.holeCards) {
        usedCards.push(...player.holeCards);
      }
    });
    
    // Collect community cards
    if (game.communityCards) {
      usedCards.push(...game.communityCards);
    }
    
    return usedCards;
  }

  // Get available cards (not used)
  getAvailableCards(usedCards) {
    const allCards = [];
    
    // Generate all possible cards
    this.cardSuits.forEach(suit => {
      this.cardValues.forEach(value => {
        allCards.push({ suit, value });
      });
    });
    
    // Filter out used cards
    return allCards.filter(card => 
      !usedCards.some(usedCard => 
        usedCard.suit === card.suit && usedCard.value === card.value
      )
    );
  }

  // Reset player states for new betting round
  async resetPlayerStatesForNewRound(gameId) {
    await Player.update(
      { 
        currentBet: 0,
        hasActedThisRound: false
      },
      { where: { gameId } }
    );
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
      where: { playerId: playerId, gameId }
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
    const game = await Game.findOne({ where: { gameId } });
    
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
    const game = await Game.findOne({ where: { gameId } });
    if (game && game.communityCards) {
      usedCards.push(...game.communityCards);
    }

    return usedCards;
  }

  // Settle chips and determine winner
  async settleChips(gameId, winnerId) {
    const game = await Game.findOne({ 
      where: { gameId },
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    const winner = game.players.find(p => p.playerId === winnerId);
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
        id: winner.playerId,
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
    const game = await Game.findOne({ 
      where: { gameId },
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

  // Handle showdown and determine winner
  async handleShowdown(gameId) {
    const game = await Game.findOne({ 
      where: { gameId },
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const activePlayers = game.players.filter(p => !p.isFolded && p.isActive);
    
    // Update behavior profiles for all players after hand completion
    await this.updatePlayerBehaviorProfiles(gameId);
    
    if (activePlayers.length === 1) {
      // Only one player left, they win
      const winner = activePlayers[0];
      await this.distributePot(gameId, [winner]);
      
      // Check if game should continue or end
      const shouldContinue = await this.shouldGameContinue(gameId);
      if (shouldContinue) {
        // Start next hand
        await this.startNextHand(gameId);
        return { 
          winner, 
          pot: game.currentPot, 
          gameContinued: true,
          handNumber: game.handNumber + 1
        };
      } else {
        // End the game
        await game.update({ 
          status: 'completed',
          winner: winner.playerId,
          currentRound: 'showdown'
        });
        return { 
          winner, 
          pot: game.currentPot, 
          gameContinued: false,
          gameEnded: true
        };
      }
    }

    // Multiple players, need to compare hands
    const handEvaluations = await this.evaluateAllHands(gameId, activePlayers);
    const winner = handEvaluations[0]; // Highest hand wins

    await this.distributePot(gameId, [winner]);
    
    // Check if game should continue or end
    const shouldContinue = await this.shouldGameContinue(gameId);
    if (shouldContinue) {
      // Start next hand
      await this.startNextHand(gameId);
      return { 
        winner, 
        pot: game.currentPot, 
        handEvaluations,
        gameContinued: true,
        handNumber: game.handNumber + 1
      };
    } else {
      // End the game
      await game.update({ 
        status: 'completed',
        winner: winner.playerId,
        currentRound: 'showdown'
      });
      return { 
        winner, 
        pot: game.currentPot, 
        handEvaluations,
        gameContinued: false,
        gameEnded: true
      };
    }
  }

  // Evaluate all player hands
  async evaluateAllHands(gameId, players) {
    const game = await Game.findOne({ where: { gameId } });
    const communityCards = game.communityCards || [];

    const evaluations = players.map(player => {
      const hand = this.evaluateHand(player.holeCards, communityCards);
      return {
        player,
        hand,
        handRank: hand.rank,
        handName: hand.name
      };
    });

    // Sort by hand strength (highest first)
    return evaluations.sort((a, b) => b.handRank - a.handRank);
  }

  // Evaluate a single hand
  evaluateHand(holeCards, communityCards) {
    const allCards = [...holeCards, ...communityCards];
    
    // Simple hand evaluation (can be enhanced with proper poker hand ranking)
    const suits = allCards.map(card => card.suit);
    const values = allCards.map(card => card.value);
    
    // Check for pairs, three of a kind, etc.
    const valueCounts = {};
    values.forEach(value => {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    
    // Simple ranking system
    if (counts[0] === 4) {
      return { rank: 8, name: 'Four of a Kind' };
    } else if (counts[0] === 3 && counts[1] === 2) {
      return { rank: 7, name: 'Full House' };
    } else if (counts[0] === 3) {
      return { rank: 4, name: 'Three of a Kind' };
    } else if (counts[0] === 2 && counts[1] === 2) {
      return { rank: 3, name: 'Two Pair' };
    } else if (counts[0] === 2) {
      return { rank: 2, name: 'One Pair' };
    } else {
      return { rank: 1, name: 'High Card' };
    }
  }

  // Distribute pot to winner(s)
  async distributePot(gameId, winners) {
    const game = await Game.findOne({ where: { gameId } });
    const potPerWinner = Math.floor(game.currentPot / winners.length);
    const remainder = game.currentPot % winners.length;

    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      const amount = potPerWinner + (i < remainder ? 1 : 0);
      
      await winner.update({
        chips: winner.chips + amount
      });
    }

    await game.update({ currentPot: 0 });
  }

  // Check if game should end
  async checkGameEnd(gameId) {
    const players = await Player.findAll({ 
      where: { gameId, isActive: true }
    });

    const playersWithChips = players.filter(p => p.chips > 0);
    
    if (playersWithChips.length <= 1) {
      // Game should end
      if (playersWithChips.length === 1) {
        const winner = playersWithChips[0];
        await this.distributePot(gameId, [winner]);
        const game = await Game.findOne({ where: { gameId } });
        await game.update({ 
          status: 'completed',
          winner: winner.playerId
        });
      }
      return true;
    }

    return false;
  }

  // Check if game should continue to next hand
  async shouldGameContinue(gameId) {
    const players = await Player.findAll({ 
      where: { gameId, isActive: true }
    });

    const playersWithChips = players.filter(p => p.chips > 0);
    
    // Continue if at least 2 players have chips
    return playersWithChips.length >= 2;
  }

  // Start the next hand after showdown
  async startNextHand(gameId) {
    const game = await Game.findOne({ 
      where: { gameId },
      include: [{ model: Player, as: 'players' }]
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Increment hand number
    const newHandNumber = game.handNumber + 1;

    // Reset game state for next hand
    await game.update({
      status: 'active', // Keep game active
      currentPot: 0,
      currentBet: 0,
      currentRound: 'preflop',
      communityCards: [],
      winner: null,
      handNumber: newHandNumber
    });

    // Reset all players for next hand
    await Promise.all(game.players.map(player => 
      player.update({
        currentBet: 0,
        holeCards: [],
        isFolded: false,
        isAllIn: false,
        hasActedThisRound: false,
        isActive: player.chips > 0 // Only keep active if they have chips
      })
    ));

    // Move dealer button and setup positions for next hand
    const playersWithChips = game.players.filter(p => p.chips > 0);
    if (playersWithChips.length > 1) {
      await this.rotateDealerButton(gameId, playersWithChips);
      await this.setupPositions(game, playersWithChips);
      
      // Post blinds for next hand
      await this.postBlinds(gameId);
      
      // Deal new hole cards
      await this.dealHoleCards(gameId);
    }

    return {
      handNumber: newHandNumber,
      activePlayers: playersWithChips.length
    };
  }

  // Rotate dealer button to next player
  async rotateDealerButton(gameId, players) {
    const game = await Game.findOne({ where: { gameId } });
    if (!game) {
      throw new Error('Game not found');
    }

    // Find current dealer position
    const currentDealerIndex = players.findIndex(p => p.role === 'button');
    const nextDealerIndex = (currentDealerIndex + 1) % players.length;
    
    // Update dealer position in game
    await game.update({ dealerPosition: nextDealerIndex });
  }

  // Update behavior profiles for all players in the game
  async updatePlayerBehaviorProfiles(gameId) {
    try {
      const players = await Player.findAll({ where: { gameId } });
      
      for (const player of players) {
        // Get all actions for this player in this hand
        const actions = await Action.findAll({
          where: {
            gameId,
            playerId: player.playerId,
            handNumber: await this.getCurrentHandNumber(gameId)
          },
          order: [['createdAt', 'ASC']]
        });
        
        if (actions.length > 0) {
          await AIService.updateBehaviorProfile(player.playerId, actions);
        }
      }
    } catch (error) {
      console.error('Error updating behavior profiles:', error);
    }
  }

  // Get current hand number for the game
  async getCurrentHandNumber(gameId) {
    const game = await Game.findOne({ where: { gameId } });
    return game ? game.handNumber : 1;
  }

  // Get game state for client
  async getGameState(gameId) {
    const game = await Game.findOne({ 
      where: { gameId },
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
        id: game.gameId,
        status: game.status,
        smallBlind: game.smallBlind,
        bigBlind: game.bigBlind,
        currentPot: game.currentPot,
        currentBet: game.currentBet,
        currentRound: game.currentRound,
        dealerPosition: game.dealerPosition,
        communityCards: game.communityCards,
        winner: game.winner,
        currentPlayerId: game.currentPlayerId,
        handNumber: game.handNumber
      },
      players: game.players
        .map(player => ({
          id: player.playerId,
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
        id: action.actionId,
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
