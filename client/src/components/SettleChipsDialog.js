import React, { useState } from 'react';
import { X, Trophy, Coins } from 'lucide-react';
import './SettleChipsDialog.css';

const SettleChipsDialog = ({ 
  players = [], 
  potAmount = 0, 
  onSettle, 
  onCancel, 
  loading = false 
}) => {
  const [selectedWinner, setSelectedWinner] = useState(null);

  const handleSettle = () => {
    if (selectedWinner) {
      onSettle(selectedWinner.id);
    }
  };

  return (
    <div className="settle-chips-dialog-overlay" onClick={onCancel}>
      <div className="settle-chips-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="settle-chips-dialog-header">
          <h2 className="settle-chips-dialog-title">
            <Trophy size={24} />
            Settle Chips
          </h2>
          <button className="settle-chips-dialog-close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="settle-chips-dialog-pot-info">
          <div className="settle-chips-dialog-pot-label">
            <Coins size={20} />
            Total Pot
          </div>
          <div className="settle-chips-dialog-pot-amount">${potAmount}</div>
        </div>

        <div className="settle-chips-dialog-players-list">
          <div className="settle-chips-dialog-players-title">Select Winner</div>
          {players.map((player) => (
            <div
              key={player.id}
              className={`settle-chips-dialog-player-item ${selectedWinner?.id === player.id ? 'selected' : ''}`}
              onClick={() => setSelectedWinner(player)}
            >
              <div className="settle-chips-dialog-player-info">
                <div className="settle-chips-dialog-player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="settle-chips-dialog-player-details">
                  <div className="settle-chips-dialog-player-name">
                    {player.name}
                    {player.isHuman && ' (You)'}
                  </div>
                  <div className="settle-chips-dialog-player-chips">
                    <Coins size={14} />
                    ${player.chips}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="settle-chips-dialog-action-buttons">
          <button 
            type="button"
            className="settle-chips-dialog-action-button secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="settle-chips-dialog-action-button primary"
            onClick={handleSettle}
            disabled={loading || !selectedWinner}
          >
            {loading ? 'Settling...' : 'Settle Chips'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettleChipsDialog;