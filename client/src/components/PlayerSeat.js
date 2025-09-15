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
  onSetAsMe,
  onSetPlayerHoleCards,
  onPlayerAction
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

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (onSetPlayerHoleCards) {
      onSetPlayerHoleCards(player);
    }
  };

  const handleActionClick = (actionType, e) => {
    e.stopPropagation();
    if (onPlayerAction) {
      onPlayerAction(player, actionType);
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
        className={`player-seat-avatar ${getStatusClass()} ${isCurrentPlayer ? 'current-player' : ''} clickable-avatar`}
        style={{
          background: player.avatar ? `url(${player.avatar})` : 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)'
        }}
        onClick={handleAvatarClick}
        title="点击设置手牌"
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

      {/* 操作按钮区域 */}
      {onPlayerAction && (
        <div className="player-seat-actions">
          <button 
            className="player-seat-action-btn call"
            onClick={(e) => handleActionClick('call', e)}
            title="跟注"
          >
            Call
          </button>
          <button 
            className="player-seat-action-btn raise"
            onClick={(e) => handleActionClick('raise', e)}
            title="加注"
          >
            Raise
          </button>
          <button 
            className="player-seat-action-btn fold"
            onClick={(e) => handleActionClick('fold', e)}
            title="弃牌"
          >
            Fold
          </button>
          <button 
            className="player-seat-action-btn allin"
            onClick={(e) => handleActionClick('allin', e)}
            title="全下"
          >
            All In
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;
