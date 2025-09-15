import React from 'react';
import { User, Coins } from 'lucide-react';
import './PlayerSeat.css';

const PlayerSeat = ({ 
  player, 
  position, 
  isCurrentPlayer, 
  isMe,
  myPlayerId,
  onAction, 
  onGetAIRecommendation,
  onSetAsMe
}) => {
  const getStatusClass = () => {
    if (player.isFolded) return 'folded';
    if (player.isAllIn) return 'all-in';
    return '';
  };

  const getStatusIndicator = () => {
    if (player.isFolded) return 'F';
    if (player.isAllIn) return 'A';
    if (player.role === 'button') return 'D';
    return null;
  };

  const getStatusClassIndicator = () => {
    if (player.isFolded) return 'folded';
    if (player.isAllIn) return 'all-in';
    if (player.role === 'button') return 'dealer';
    return '';
  };

  const handleSetAsMe = (e) => {
    e.stopPropagation();
    if (onSetAsMe) {
      onSetAsMe(player.id);
    }
  };

  return (
    <div
      className={`player-seat-container ${isCurrentPlayer ? 'current-player' : ''} ${isMe ? 'is-me' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div 
        className={`player-seat-avatar ${getStatusClass()} ${isCurrentPlayer ? 'current-player' : ''}`}
        style={{
          background: player.avatar ? `url(${player.avatar})` : 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)'
        }}
      >
        {!player.avatar && <User size={24} color="white" />}
        {player.currentBet > 0 && (
          <div className="player-seat-bet">
            ${player.currentBet}
          </div>
        )}
        {getStatusIndicator() && (
          <div className={`player-seat-dealer-button ${getStatusClassIndicator()}`}>
            {getStatusIndicator()}
          </div>
        )}
      </div>

      <div className="player-seat-info">
        <div className="player-seat-name">
          {player.name}
          {player.isHuman && ' (You)'}
          {isMe && ' (Me)'}
        </div>
        <div className="player-seat-chips">
          <Coins size={12} />
          ${player.chips}
        </div>
        <div className="player-seat-position">{player.role}</div>
        {!isMe && onSetAsMe && !myPlayerId && (
          <button 
            className="set-as-me-btn"
            onClick={handleSetAsMe}
            title="设置为自己"
          >
            设为我
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerSeat;
