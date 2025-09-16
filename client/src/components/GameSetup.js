import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import './GameSetup.css';

const GameSetup = () => {
  const { createGame, loading, error } = useGame();
  const navigate = useNavigate();
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);

  const handleCreateGame = async () => {
    try {
      const game = await createGame(smallBlind, bigBlind);
      // Navigate to the game URL with the game ID
      navigate(`/game/${game.gameId}`);
    } catch (err) {
      console.error('Failed to create game:', err);
    }
  };

  return (
    <div className="game-setup-container">
      <div className="game-setup-card">
        {error && <div className="game-setup-error">{error}</div>}

        <div className="game-setup-form-group">
          <label className="game-setup-label">Small Blind</label>
          <input
            className="game-setup-input"
            type="number"
            value={smallBlind}
            onChange={(e) => setSmallBlind(parseInt(e.target.value) || 10)}
            min="1"
          />
        </div>

        <div className="game-setup-form-group">
          <label className="game-setup-label">Big Blind</label>
          <input
            className="game-setup-input"
            type="number"
            value={bigBlind}
            onChange={(e) => setBigBlind(parseInt(e.target.value) || 20)}
            min="1"
          />
        </div>

        <button className="game-setup-button" onClick={handleCreateGame} disabled={loading}>
          {loading ? 'Creating...' : 'Create Game & Enter Table'}
        </button>
      </div>
    </div>
  );
};

export default GameSetup;
