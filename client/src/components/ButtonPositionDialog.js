import React, { useState } from 'react';
import { X } from 'lucide-react';
import './ButtonPositionDialog.css';

const ButtonPositionDialog = ({ 
  isOpen, 
  onClose, 
  players = [], 
  onSetButtonPosition,
  loading = false 
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (selectedPlayerId && onSetButtonPosition) {
      await onSetButtonPosition(selectedPlayerId);
      setSelectedPlayerId(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedPlayerId(null);
    onClose();
  };

  return (
    <div className="button-position-dialog-overlay">
      <div className="button-position-dialog">
        <div className="button-position-dialog-header">
          <h3>设置按钮位置</h3>
          <button 
            className="button-position-dialog-close"
            onClick={handleCancel}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="button-position-dialog-content">
          <p className="button-position-dialog-description">
            选择哪个玩家作为按钮位置（庄家位置），其他位置将按顺时针方向自动分配。
          </p>
          
          <div className="button-position-dialog-players">
            {players.map((player) => (
              <div 
                key={player.id}
                className={`button-position-dialog-player ${
                  selectedPlayerId === player.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedPlayerId(player.id)}
              >
                <div className="button-position-dialog-player-avatar">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} />
                  ) : (
                    <div className="button-position-dialog-player-avatar-placeholder">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="button-position-dialog-player-info">
                  <div className="button-position-dialog-player-name">
                    {player.name}
                  </div>
                  <div className="button-position-dialog-player-role">
                    当前: {player.role}
                  </div>
                </div>
                {selectedPlayerId === player.id && (
                  <div className="button-position-dialog-player-selected">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="button-position-dialog-footer">
          <button 
            className="button-position-dialog-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            取消
          </button>
          <button 
            className="button-position-dialog-confirm"
            onClick={handleConfirm}
            disabled={!selectedPlayerId || loading}
          >
            {loading ? '设置中...' : '确认设置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ButtonPositionDialog;
