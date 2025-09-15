import React, { createContext, useContext, useState } from 'react';
import { gameAPI } from '../services/api';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Create a new game
  const createGame = async (smallBlind = 10, bigBlind = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.createGame(smallBlind, bigBlind);
      if (response.success) {
        setGameState(response.data);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current game state
  const getGameState = async (gameId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.getGameState(gameId);
      if (response.success) {
        setGameState(response.data);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add player to game
  const addPlayer = async (gameId, playerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.addPlayer(gameId, playerData);
      if (response.success) {
        // Refresh game state after adding player
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Start game
  const startGame = async (gameId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.startGame(gameId);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Make player action
  const makeAction = async (gameId, playerId, actionType, amount = 0, round) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.makeAction(gameId, playerId, actionType, amount, round);
      if (response.success) {
        // Refresh game state after action
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deal community cards
  const dealCommunityCards = async (gameId, round) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.dealCommunityCards(gameId, round);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get AI recommendation
  const getAIRecommendation = async (gameId, playerId, currentRound) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.getAIRecommendation(gameId, playerId, currentRound);
      if (response.success) {
        setAiRecommendation(response.data);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get pot size suggestions
  const getPotSizeSuggestions = async (gameId) => {
    try {
      const response = await gameAPI.getPotSizeSuggestions(gameId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Set player hole cards
  const setHoleCards = async (gameId, playerId, holeCards) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.setHoleCards(gameId, playerId, holeCards);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set community cards manually
  const setCommunityCards = async (gameId, cards, round) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.setCommunityCards(gameId, cards, round);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Settle chips and determine winner
  const settleChips = async (gameId, winnerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.settleChips(gameId, winnerId);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // End current hand and prepare for next hand
  const endHand = async (gameId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.endHand(gameId);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get next player to act
  const getNextPlayer = async (gameId) => {
    try {
      const response = await gameAPI.getNextPlayer(gameId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Set current player
  const setCurrentPlayer = async (gameId, playerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.setCurrentPlayer(gameId, playerId);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update player chips
  const updatePlayerChips = async (gameId, playerId, chips) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gameAPI.updatePlayerChips(gameId, playerId, chips);
      if (response.success) {
        await getGameState(gameId);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear AI recommendation
  const clearAIRecommendation = () => {
    setAiRecommendation(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    gameState,
    loading,
    error,
    aiRecommendation,
    createGame,
    getGameState,
    addPlayer,
    startGame,
    makeAction,
    dealCommunityCards,
    getAIRecommendation,
    getPotSizeSuggestions,
    setHoleCards,
    setCommunityCards,
    settleChips,
    endHand,
    getNextPlayer,
    setCurrentPlayer,
    updatePlayerChips,
    clearAIRecommendation,
    clearError
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
