import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import './AddPlayerDialog.css';

const AddPlayerDialog = ({ 
  onAddPlayer, 
  onCancel, 
  loading = false,
  maxPlayers = 8,
  currentPlayerCount = 0
}) => {
  const [playerName, setPlayerName] = useState('');
  const [initialChips, setInitialChips] = useState(1000);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && initialChips > 0) {
      onAddPlayer({
        name: playerName.trim(),
        chips: initialChips,
        isHuman: false, // AI players by default
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`
      });
      setPlayerName('');
      setInitialChips(1000);
    }
  };

  const canAddPlayer = currentPlayerCount < maxPlayers;

  return (
    <div className="add-player-dialog-overlay" onClick={onCancel}>
      <div className="add-player-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="add-player-dialog-header">
          <h2 className="add-player-dialog-title">
            <User size={24} />
            Add Player
          </h2>
          <button className="add-player-dialog-close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        {!canAddPlayer && (
          <div className="add-player-dialog-error">
            Maximum {maxPlayers} players reached
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="add-player-dialog-form-group">
            <label className="add-player-dialog-label">Player Name</label>
            <input
              className="add-player-dialog-input"
              type="text"
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={!canAddPlayer || loading}
              required
            />
          </div>

          <div className="add-player-dialog-form-group">
            <label className="add-player-dialog-label">Initial Chips</label>
            <input
              className="add-player-dialog-input"
              type="number"
              placeholder="Enter initial chips"
              value={initialChips}
              onChange={(e) => setInitialChips(parseInt(e.target.value) || 0)}
              min="1"
              disabled={!canAddPlayer || loading}
              required
            />
          </div>

          <div className="add-player-dialog-action-buttons">
            <button 
              type="button"
              className="add-player-dialog-action-button secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="add-player-dialog-action-button primary"
              disabled={!canAddPlayer || loading || !playerName.trim() || initialChips <= 0}
            >
              {loading ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlayerDialog;
