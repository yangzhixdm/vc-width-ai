import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Game API
export const gameAPI = {
  // Create a new game
  createGame: async (smallBlind = 10, bigBlind = 20) => {
    const response = await api.post('/api/games', {
      smallBlind,
      bigBlind
    });
    return response.data;
  },

  // Get game state
  getGameState: async (gameId) => {
    const response = await api.get(`/api/games/${gameId}`);
    return response.data;
  },

  // Add player to game
  addPlayer: async (gameId, playerData) => {
    const response = await api.post(`/api/games/${gameId}/players`, playerData);
    return response.data;
  },

  // Start game
  startGame: async (gameId) => {
    const response = await api.post(`/api/games/${gameId}/start`);
    return response.data;
  },

  // Make player action
  makeAction: async (gameId, playerId, actionType, amount = 0, round) => {
    const response = await api.post(`/api/games/${gameId}/players/${playerId}/actions`, {
      actionType,
      amount,
      round
    });
    return response.data;
  },

  // Deal community cards
  dealCommunityCards: async (gameId, round) => {
    const response = await api.post(`/api/games/${gameId}/community-cards`, {
      round
    });
    return response.data;
  },

  // Get AI recommendation
  getAIRecommendation: async (gameId, playerId, currentRound) => {
    const response = await api.post(`/api/games/${gameId}/players/${playerId}/ai-recommendation`, {
      currentRound
    });
    return response.data;
  },

  // Get pot size suggestions
  getPotSizeSuggestions: async (gameId) => {
    const response = await api.get(`/api/games/${gameId}/pot-suggestions`);
    return response.data;
  },

  // Set player hole cards
  setHoleCards: async (gameId, playerId, holeCards) => {
    const response = await api.post(`/api/games/${gameId}/players/${playerId}/hole-cards`, {
      holeCards
    });
    return response.data;
  },

  // Set community cards manually
  setCommunityCards: async (gameId, cards, round) => {
    const response = await api.post(`/api/games/${gameId}/community-cards`, {
      cards,
      round
    });
    return response.data;
  },

  // Settle chips and determine winner
  settleChips: async (gameId, winnerId) => {
    const response = await api.post(`/api/games/${gameId}/settle`, {
      winnerId
    });
    return response.data;
  },

  // End current hand and prepare for next hand
  endHand: async (gameId) => {
    const response = await api.post(`/api/games/${gameId}/end-hand`);
    return response.data;
  },

  // Get next player to act
  getNextPlayer: async (gameId) => {
    const response = await api.get(`/api/games/${gameId}/next-player`);
    return response.data;
  },

  // Set current player
  setCurrentPlayer: async (gameId, playerId) => {
    const response = await api.post(`/api/games/${gameId}/current-player`, {
      playerId
    });
    return response.data;
  },

  // Update player chips
  updatePlayerChips: async (gameId, playerId, chips) => {
    const response = await api.put(`/api/games/${gameId}/players/${playerId}/chips`, {
      chips
    });
    return response.data;
  },

  // Set button position manually
  setButtonPosition: async (gameId, buttonPlayerId) => {
    const response = await api.post(`/api/games/${gameId}/set-button`, {
      buttonPlayerId
    });
    return response.data;
  },

  // Check if player can check
  canPlayerCheck: async (gameId, playerId) => {
    const response = await api.get(`/api/games/${gameId}/players/${playerId}/can-check`);
    return response.data;
  },

  // Set player as "me"
  setPlayerAsMe: async (gameId, playerId) => {
    const response = await api.post(`/api/games/${gameId}/players/${playerId}/set-me`);
    return response.data;
  },

  // Get the "me" player for a game
  getMePlayer: async (gameId) => {
    const response = await api.get(`/api/games/${gameId}/me-player`);
    return response.data;
  },

  // Buy in chips for a player
  buyInChips: async (gameId, playerId, amount = 2000) => {
    const response = await api.post(`/api/games/${gameId}/players/${playerId}/buy-in`, {
      amount
    });
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
