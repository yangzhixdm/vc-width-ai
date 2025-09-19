const GameService = require('../services/GameService');
const AIService = require('../services/AIService');
const { BehaviorProfile } = require('../models');

class GameController {
  // Create a new game
  async createGame(ctx) {
    try {
      const { smallBlind = 10, bigBlind = 20 } = ctx.request.body;
      const game = await GameService.createGame(smallBlind, bigBlind);
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: game
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get game state
  async getGameState(ctx) {
    try {
      const { gameId } = ctx.params;
      const gameState = await GameService.getGameState(gameId);
      
      ctx.body = {
        success: true,
        data: gameState
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Add player to game
  async addPlayer(ctx) {
    try {
      const { gameId } = ctx.params;
      const playerData = ctx.request.body;
      
      const player = await GameService.addPlayer(gameId, playerData);
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: player
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Start game
  async startGame(ctx) {
    try {
      const { gameId } = ctx.params;
      const game = await GameService.startGame(gameId);
      
      ctx.body = {
        success: true,
        data: game
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Make player action
  async makeAction(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      const { actionType, amount = 0, round } = ctx.request.body;
      
      const action = await GameService.makeAction(gameId, playerId, actionType, amount, round);
      
      ctx.body = {
        success: true,
        data: action
      };
    } catch (error) {
      console.log("error", error.stack);
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Deal community cards
  async dealCommunityCards(ctx) {
    try {
      const { gameId } = ctx.params;
      const { round } = ctx.request.body;
      
      const newCards = await GameService.dealCommunityCards(gameId, round);
      
      ctx.body = {
        success: true,
        data: { newCards }
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get AI recommendation
  async getAIRecommendation(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      const { currentRound } = ctx.request.body;
      
      const recommendation = await AIService.getBettingRecommendation(gameId, playerId, currentRound);
      
      ctx.body = {
        success: true,
        data: recommendation
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get pot size suggestions
  async getPotSizeSuggestions(ctx) {
    try {
      const { gameId } = ctx.params;
      const gameState = await GameService.getGameState(gameId);
      
      const pot = gameState.game.currentPot;
      const suggestions = {
        '1/3 pot': Math.floor(pot / 3),
        '1/2 pot': Math.floor(pot / 2),
        '2/3 pot': Math.floor(pot * 2 / 3),
        '1x pot': pot,
        '1.5x pot': Math.floor(pot * 1.5),
        '2x pot': pot * 2
      };
      
      ctx.body = {
        success: true,
        data: suggestions
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Set player hole cards
  async setHoleCards(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      const { holeCards } = ctx.request.body;
      
      const player = await GameService.setPlayerHoleCards(gameId, playerId, holeCards);
      
      ctx.body = {
        success: true,
        data: player
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Set community cards manually
  async setCommunityCards(ctx) {
    try {
      const { gameId } = ctx.params;
      const { cards, round } = ctx.request.body;
      
      const game = await GameService.setCommunityCards(gameId, cards, round);
      
      ctx.body = {
        success: true,
        data: game
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Settle chips and determine winner
  async settleChips(ctx) {
    try {
      const { gameId } = ctx.params;
      const { winnerId } = ctx.request.body;
      
      if (!winnerId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Winner ID is required'
        };
        return;
      }
      
      const result = await GameService.settleChips(gameId, winnerId);
      
      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // End current hand and prepare for next hand
  async endHand(ctx) {
    try {
      const { gameId } = ctx.params;
      
      const game = await GameService.endHand(gameId);
      
      ctx.body = {
        success: true,
        data: game
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get next player to act
  async getNextPlayer(ctx) {
    try {
      const { gameId } = ctx.params;
      
      const nextPlayer = await GameService.getNextPlayer(gameId);
      
      ctx.body = {
        success: true,
        data: nextPlayer
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Set current player
  async setCurrentPlayer(ctx) {
    try {
      const { gameId } = ctx.params;
      const { playerId } = ctx.request.body;
      
      if (!playerId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Player ID is required'
        };
        return;
      }
      
      const game = await GameService.setCurrentPlayer(gameId, playerId);
      
      ctx.body = {
        success: true,
        data: game
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Update player chips
  async updatePlayerChips(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      const { chips } = ctx.request.body;
      
      if (chips === undefined || chips < 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Valid chips amount is required'
        };
        return;
      }
      
      const player = await GameService.updatePlayerChips(gameId, playerId, chips);
      
      ctx.body = {
        success: true,
        data: player
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get player behavior profile
  async getPlayerBehaviorProfile(ctx) {
    try {
      const { playerId } = ctx.params;
      
      const profile = await BehaviorProfile.findOne({
        where: { playerId }
      });
      
      if (!profile) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Behavior profile not found'
        };
        return;
      }
      
      ctx.body = {
        success: true,
        data: profile
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get all behavior profiles for a game
  async getGameBehaviorProfiles(ctx) {
    try {
      const { gameId } = ctx.params;
      
      // Get all players in the game
      const gameState = await GameService.getGameState(gameId);
      const playerIds = gameState.players.map(p => p.id);
      
      // Get behavior profiles for all players
      const profiles = await BehaviorProfile.findAll({
        where: {
          playerId: playerIds
        }
      });
      
      ctx.body = {
        success: true,
        data: profiles
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Update behavior profile manually (for testing)
  async updateBehaviorProfile(ctx) {
    try {
      const { playerId } = ctx.params;
      const { actions } = ctx.request.body;
      
      if (!actions || !Array.isArray(actions)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Actions array is required'
        };
        return;
      }
      
      await AIService.updateBehaviorProfile(playerId, actions);
      
      ctx.body = {
        success: true,
        message: 'Behavior profile updated successfully'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Set button position manually
  async setButtonPosition(ctx) {
    try {
      const { gameId } = ctx.params;
      const { buttonPlayerId } = ctx.request.body;
      
      if (!buttonPlayerId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Button player ID is required'
        };
        return;
      }
      
      const game = await GameService.setButtonPosition(gameId, buttonPlayerId);
      
      ctx.body = {
        success: true,
        data: game
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Check if player can check
  async canPlayerCheck(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      
      const canCheck = await GameService.canPlayerCheck(gameId, playerId);
      
      ctx.body = {
        success: true,
        data: { canCheck }
      };
    } catch (error) {
      console.log("error", error.stack);
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Set player as "me"
  async setPlayerAsMe(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      
      const player = await GameService.setPlayerAsMe(gameId, playerId);
      
      ctx.body = {
        success: true,
        data: player
      };
    } catch (error) {
      console.log("error", error.stack);
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Get the "me" player for a game
  async getMePlayer(ctx) {
    try {
      const { gameId } = ctx.params;
      
      const player = await GameService.getMePlayer(gameId);
      
      ctx.body = {
        success: true,
        data: player
      };
    } catch (error) {
      console.log("error", error.stack);
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }

  // Buy in chips for a player
  async buyInChips(ctx) {
    try {
      const { gameId, playerId } = ctx.params;
      const { amount = 2000 } = ctx.request.body;
      
      const player = await GameService.buyInChips(gameId, playerId, amount);
      
      ctx.body = {
        success: true,
        data: player
      };
    } catch (error) {
      console.log("error", error.stack);
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GameController();
