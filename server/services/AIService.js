const OpenAI = require('openai');
const { Action, Player, BehaviorProfile } = require('../models');
const config = require('../config.example');

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
      
      // Get recent actions from current game
      const recentActions = await this.getRecentActions(gameId, currentRound);
      
      // Get current game context
      const gameContext = await this.getGameContext(gameId, playerId);
      
      // Prepare prompt for LLM
      const prompt = this.buildAnalysisPrompt(behaviorProfile, recentActions, gameContext);
      
      // Get recommendation from OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Texas Hold\'em poker AI assistant. Analyze the game situation and provide betting recommendations based on player behavior patterns, position, and game context. Respond with a JSON object containing your recommendation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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

  // Build analysis prompt for LLM
  buildAnalysisPrompt(behaviorProfile, recentActions, gameContext) {
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

PLAYER BEHAVIOR PROFILE:
- VPIP: ${behaviorProfile.vpip}%
- PFR: ${behaviorProfile.pfr}%
- Aggression Factor: ${behaviorProfile.aggressionFactor}
- Fold to C-bet: ${behaviorProfile.foldToCbet}%
- C-bet Frequency: ${behaviorProfile.cbetFrequency}%
- 3-bet Frequency: ${behaviorProfile.threeBetFrequency}%
- Total Hands: ${behaviorProfile.totalHands}

RECENT ACTIONS THIS ROUND:
${recentActions.map(action => 
  `- ${action.playerName} (pos ${action.position}): ${action.actionType} ${action.amount > 0 ? `$${action.amount}` : ''}`
).join('\n')}

Provide your recommendation as a JSON object with:
{
  "action": "check|call|raise|fold",
  "amount": number (if raise),
  "confidence": 0-100,
  "reasoning": "brief explanation"
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
