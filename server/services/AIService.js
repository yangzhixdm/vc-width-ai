const OpenAI = require('openai');
const { Action, Player, BehaviorProfile } = require('../models');
const config = require('../config');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  // Analyze player behavior and provide betting recommendation
  async getBettingRecommendation(gameId, playerId, currentRound) {
    try {
      // Get player's behavior profile
      const behaviorProfile = await this.getPlayerBehaviorProfile(playerId);
      
      // Get all players' behavior profiles and stats
      const allPlayersProfiles = await this.getAllPlayersProfiles(gameId);
      
      // Get recent actions from current game
      const recentActions = await this.getRecentActions(gameId, currentRound);
      
      // Get historical hand data for all players
      const historicalHands = await this.getHistoricalHands(gameId);
      
      // Get current game context
      const gameContext = await this.getGameContext(gameId, playerId);
      
      // Prepare prompt for LLM
      const prompt = this.buildEnhancedAnalysisPrompt(
        behaviorProfile, 
        allPlayersProfiles, 
        recentActions, 
        historicalHands, 
        gameContext
      );
      
      // Get recommendation from OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Texas Hold\'em poker AI assistant. Analyze the game situation and provide betting recommendations based on player behavior patterns, historical data, position, and game context. Consider all players\' tendencies and past actions. Respond with a JSON object containing your recommendation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const recommendation = JSON.parse(response.choices[0].message.content);
      
      // Store the recommendation
      await this.storeRecommendation(gameId, playerId, recommendation);
      
      return recommendation;
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      return this.getDefaultRecommendation(gameContext);
    }
  }

  // Get player's behavior profile
  async getPlayerBehaviorProfile(playerId) {
    const profile = await BehaviorProfile.findOne({
      where: { playerId },
      include: [{ model: Player, as: 'player' }]
    });

    if (!profile) {
      return this.getDefaultBehaviorProfile();
    }

    return {
      vpip: profile.vpip,
      pfr: profile.pfr,
      aggressionFactor: profile.aggressionFactor,
      foldToCbet: profile.foldToCbet,
      cbetFrequency: profile.cbetFrequency,
      threeBetFrequency: profile.threeBetFrequency,
      foldToThreeBet: profile.foldToThreeBet,
      stealAttempts: profile.stealAttempts,
      showdownFrequency: profile.showdownFrequency,
      winRate: profile.winRate,
      totalHands: profile.totalHands
    };
  }

  // Get all players' behavior profiles and stats
  async getAllPlayersProfiles(gameId) {
    const { Game, Player } = require('../models');
    
    const players = await Player.findAll({ 
      where: { gameId },
      include: [{ model: BehaviorProfile, as: 'behaviorProfile' }]
    });

    const profiles = [];
    for (const player of players) {
      const profile = player.behaviorProfile || this.getDefaultBehaviorProfile();
      const playerStats = await this.calculatePlayerStats(player.playerId);
      
      profiles.push({
        playerId: player.playerId,
        playerName: player.name,
        position: player.position,
        role: player.role,
        chips: player.chips,
        isHuman: player.isHuman,
        isActive: player.isActive,
        isFolded: player.isFolded,
        behaviorProfile: profile,
        currentStats: playerStats
      });
    }

    return profiles;
  }

  // Get historical hand data for all players
  async getHistoricalHands(gameId) {
    const actions = await Action.findAll({
      where: { gameId },
      include: [{ model: Player, as: 'player' }],
      order: [['createdAt', 'ASC']]
    });

    // Group actions by hand/round
    const hands = {};
    actions.forEach(action => {
      const handKey = `${action.round}_${action.gameId}`;
      if (!hands[handKey]) {
        hands[handKey] = {
          round: action.round,
          communityCards: action.communityCards,
          actions: []
        };
      }
      hands[handKey].actions.push({
        playerName: action.player.name,
        playerId: action.playerId,
        position: action.position,
        actionType: action.actionType,
        amount: action.amount,
        potSize: action.potSize,
        holeCards: action.holeCards,
        isAIRecommended: action.isAIRecommended
      });
    });

    return Object.values(hands);
  }

  // Calculate current player statistics
  async calculatePlayerStats(playerId) {
    const actions = await Action.findAll({
      where: { playerId },
      order: [['createdAt', 'DESC']],
      limit: 100 // Last 100 actions
    });

    if (actions.length === 0) {
      return this.getDefaultPlayerStats();
    }

    const totalHands = new Set(actions.map(a => `${a.gameId}_${a.round}`)).size;
    const vpipHands = new Set(
      actions.filter(a => a.actionType !== 'fold').map(a => `${a.gameId}_${a.round}`)
    ).size;
    const pfrHands = new Set(
      actions.filter(a => a.actionType === 'raise').map(a => `${a.gameId}_${a.round}`)
    ).size;
    const showdownHands = new Set(
      actions.filter(a => a.round === 'river' && a.actionType !== 'fold').map(a => `${a.gameId}_${a.round}`)
    ).size;

    const aggressiveActions = actions.filter(a => ['raise', 'call'].includes(a.actionType)).length;
    const passiveActions = actions.filter(a => ['check', 'fold'].includes(a.actionType)).length;
    const totalActions = actions.length;

    return {
      vpip: totalHands > 0 ? (vpipHands / totalHands) * 100 : 0,
      pfr: totalHands > 0 ? (pfrHands / totalHands) * 100 : 0,
      showdownRate: totalHands > 0 ? (showdownHands / totalHands) * 100 : 0,
      aggressionFactor: passiveActions > 0 ? aggressiveActions / passiveActions : 0,
      foldRate: totalActions > 0 ? (actions.filter(a => a.actionType === 'fold').length / totalActions) * 100 : 0,
      raiseRate: totalActions > 0 ? (actions.filter(a => a.actionType === 'raise').length / totalActions) * 100 : 0,
      callRate: totalActions > 0 ? (actions.filter(a => a.actionType === 'call').length / totalActions) * 100 : 0,
      totalHands: totalHands,
      totalActions: totalActions
    };
  }

  // Get recent actions from current round
  async getRecentActions(gameId, currentRound) {
    const actions = await Action.findAll({
      where: { gameId, round: currentRound },
      include: [{ model: Player, as: 'player' }],
      order: [['createdAt', 'ASC']]
    });

    return actions.map(action => ({
      playerName: action.player.name,
      position: action.position,
      actionType: action.actionType,
      amount: action.amount,
      potSize: action.potSize,
      isAIRecommended: action.isAIRecommended
    }));
  }

  // Get current game context
  async getGameContext(gameId, playerId) {
    const { Game, Player } = require('../models');
    
    const game = await Game.findByPk(gameId);
    const player = await Player.findByPk(playerId);
    const allPlayers = await Player.findAll({ where: { gameId } });

    return {
      currentRound: game.currentRound,
      currentPot: game.currentPot,
      currentBet: game.currentBet,
      communityCards: game.communityCards,
      playerPosition: player.position,
      playerRole: player.role,
      playerChips: player.chips,
      playerCurrentBet: player.currentBet,
      playerHoleCards: player.holeCards,
      activePlayers: allPlayers.filter(p => p.isActive && !p.isFolded).length,
      potOdds: this.calculatePotOdds(game.currentPot, game.currentBet, player.currentBet)
    };
  }

  // Build enhanced analysis prompt for LLM
  buildEnhancedAnalysisPrompt(behaviorProfile, allPlayersProfiles, recentActions, historicalHands, gameContext) {
    const currentPlayer = allPlayersProfiles.find(p => p.playerId === gameContext.playerId);
    const otherPlayers = allPlayersProfiles.filter(p => p.playerId !== gameContext.playerId);

    return `
Analyze this Texas Hold'em situation and provide a betting recommendation:

GAME CONTEXT:
- Current Round: ${gameContext.currentRound}
- Current Pot: ${gameContext.currentPot}
- Current Bet: ${gameContext.currentBet}
- Community Cards: ${JSON.stringify(gameContext.communityCards)}
- Player Position: ${gameContext.playerPosition} (${gameContext.playerRole})
- Player Chips: ${gameContext.playerChips}
- Player Current Bet: ${gameContext.playerCurrentBet}
- Player Hole Cards: ${JSON.stringify(gameContext.playerHoleCards)}
- Active Players: ${gameContext.activePlayers}
- Pot Odds: ${gameContext.potOdds}%

CURRENT PLAYER PROFILE:
- VPIP: ${currentPlayer?.currentStats.vpip.toFixed(1)}% (入池率)
- PFR: ${currentPlayer?.currentStats.pfr.toFixed(1)}% (翻牌前加注率)
- Showdown Rate: ${currentPlayer?.currentStats.showdownRate.toFixed(1)}% (摊牌率)
- Aggression Factor: ${currentPlayer?.currentStats.aggressionFactor.toFixed(2)}
- Fold Rate: ${currentPlayer?.currentStats.foldRate.toFixed(1)}%
- Raise Rate: ${currentPlayer?.currentStats.raiseRate.toFixed(1)}%
- Call Rate: ${currentPlayer?.currentStats.callRate.toFixed(1)}%
- Total Hands: ${currentPlayer?.currentStats.totalHands}

OTHER PLAYERS PROFILES:
${otherPlayers.map(player => `
- ${player.playerName} (${player.role}, pos ${player.position}):
  * VPIP: ${player.currentStats.vpip.toFixed(1)}% | PFR: ${player.currentStats.pfr.toFixed(1)}%
  * Showdown: ${player.currentStats.showdownRate.toFixed(1)}% | Aggression: ${player.currentStats.aggressionFactor.toFixed(2)}
  * Fold: ${player.currentStats.foldRate.toFixed(1)}% | Raise: ${player.currentStats.raiseRate.toFixed(1)}%
  * Chips: $${player.chips} | Active: ${player.isActive} | Folded: ${player.isFolded}
`).join('')}

RECENT ACTIONS THIS ROUND:
${recentActions.map(action => 
  `- ${action.playerName} (pos ${action.position}): ${action.actionType} ${action.amount > 0 ? `$${action.amount}` : ''}`
).join('\n')}

HISTORICAL HAND PATTERNS (Last ${historicalHands.length} hands):
${historicalHands.slice(-3).map(hand => `
Round: ${hand.round}
Community Cards: ${JSON.stringify(hand.communityCards)}
Actions: ${hand.actions.map(a => `${a.playerName}: ${a.actionType}${a.amount > 0 ? ` $${a.amount}` : ''}`).join(', ')}
`).join('')}

ANALYSIS INSTRUCTIONS:
1. Consider each player's playing style and tendencies
2. Analyze position and stack sizes
3. Consider pot odds and implied odds
4. Factor in recent actions and betting patterns
5. Account for player types (tight/loose, aggressive/passive)

Provide your recommendation as a JSON object with:
{
  "action": "check|call|raise|fold",
  "amount": number (if raise),
  "confidence": 0-100,
  "reasoning": "detailed explanation considering all player profiles and game context",
  "playerAnalysis": "brief analysis of key opponents' likely actions"
}
`;
  }

  // Calculate pot odds
  calculatePotOdds(pot, currentBet, playerBet) {
    const callAmount = currentBet - playerBet;
    if (callAmount <= 0) return 0;
    return Math.round((callAmount / (pot + callAmount)) * 100);
  }

  // Get default behavior profile for new players
  getDefaultBehaviorProfile() {
    return {
      vpip: 20,
      pfr: 15,
      aggressionFactor: 2.0,
      foldToCbet: 60,
      cbetFrequency: 70,
      threeBetFrequency: 5,
      foldToThreeBet: 70,
      stealAttempts: 25,
      showdownFrequency: 30,
      winRate: 0,
      totalHands: 0
    };
  }

  // Get default player stats for new players
  getDefaultPlayerStats() {
    return {
      vpip: 20,
      pfr: 15,
      showdownRate: 30,
      aggressionFactor: 2.0,
      foldRate: 40,
      raiseRate: 15,
      callRate: 25,
      totalHands: 0,
      totalActions: 0
    };
  }

  // Get default recommendation when AI fails
  getDefaultRecommendation(gameContext) {
    const potOdds = gameContext.potOdds;
    
    if (potOdds > 25) {
      return {
        action: 'call',
        amount: 0,
        confidence: 60,
        reasoning: 'Good pot odds suggest calling'
      };
    } else if (gameContext.currentBet === 0) {
      return {
        action: 'check',
        amount: 0,
        confidence: 70,
        reasoning: 'No bet to call, checking'
      };
    } else {
      return {
        action: 'fold',
        amount: 0,
        confidence: 65,
        reasoning: 'Poor pot odds, folding'
      };
    }
  }

  // Store AI recommendation
  async storeRecommendation(gameId, playerId, recommendation) {
    // This could be stored in a separate table or added to the Action model
    // For now, we'll just log it
    console.log(`AI Recommendation for Player ${playerId}:`, recommendation);
  }

  // Update behavior profile after game
  async updateBehaviorProfile(playerId, actions) {
    const profile = await BehaviorProfile.findOne({ where: { playerId } });
    
    if (!profile) {
      await BehaviorProfile.create({
        playerId,
        ...this.calculateNewProfile(actions)
      });
    } else {
      const newStats = this.calculateNewProfile(actions);
      await profile.update(newStats);
    }
  }

  // Calculate new behavior statistics
  calculateNewProfile(actions) {
    const totalHands = actions.length;
    const vpipHands = actions.filter(a => a.actionType !== 'fold').length;
    const pfrHands = actions.filter(a => a.actionType === 'raise').length;
    const aggressiveActions = actions.filter(a => ['raise', 'call'].includes(a.actionType)).length;
    const passiveActions = actions.filter(a => ['check', 'fold'].includes(a.actionType)).length;

    return {
      vpip: totalHands > 0 ? (vpipHands / totalHands) * 100 : 0,
      pfr: totalHands > 0 ? (pfrHands / totalHands) * 100 : 0,
      aggressionFactor: passiveActions > 0 ? aggressiveActions / passiveActions : 0,
      totalHands: totalHands
    };
  }
}

module.exports = new AIService();
