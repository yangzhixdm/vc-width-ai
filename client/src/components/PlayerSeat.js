import React from 'react';
import { User, Coins } from 'lucide-react';
import './PlayerSeat.css';

const PlayerSeat = ({ 
  player, 
  position, 
  isCurrentPlayer, 
  onAction, 
  onGetAIRecommendation 
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

  return (
    <div
      className={`player-seat-container ${isCurrentPlayer ? 'current-player' : ''}`}
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
        </div>
        <div className="player-seat-chips">
          <Coins size={12} />
          ${player.chips}
        </div>
        <div className="player-seat-position">{player.role}</div>
      </div>
    </div>
  );
};

export default PlayerSeat;
