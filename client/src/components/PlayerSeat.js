import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import './PlayerSeat.css';

const PlayerSeat = ({ 
  player, 
  position, 
  isCurrentPlayer, 
  isMe,
  myPlayerId,
  onGetAIRecommendation,
  onSetAsMe,
  onSetPlayerHoleCards,
  onPlayerAction,
  gameStatus,
  gameId,
  canPlayerCheck,
  hasMePlayer
}) => {
  const [canCheck, setCanCheck] = useState(false);

  // Check if player can check when it's their turn
  useEffect(() => {
    const checkCanCheck = async () => {
      if (isCurrentPlayer && canPlayerCheck && gameId) {
        try {
          const result = await canPlayerCheck(gameId, player.id);
          setCanCheck(result);
        } catch (error) {
          console.error('Error checking if player can check:', error);
          setCanCheck(false);
        }
      } else {
        setCanCheck(false);
      }
    };

    checkCanCheck();
  }, [isCurrentPlayer, canPlayerCheck, gameId, player.id]);

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

  // 判断按钮是否应该禁用
  const isButtonDisabled = () => {
    // 如果游戏状态不是活跃状态，禁用所有按钮
    if (gameStatus !== 'active') {
      return true;
    }
    
    // 如果玩家已经弃牌或全下，禁用所有按钮
    if (player.isFolded || player.isAllIn) {
      return true;
    }
    
    // 如果玩家没有筹码，禁用所有按钮
    if (player.chips <= 0) {
      return true;
    }
    
    // 如果玩家不是当前轮到操作的玩家，禁用所有按钮
    if (!isCurrentPlayer) {
      return true;
    }
    
    return false;
  };

  return (
    <div
      className={`player-seat-container ${getStatusClass()} ${isCurrentPlayer ? 'current-player' : ''} ${isMe ? 'is-me' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div 
        className={`player-seat-avatar ${isCurrentPlayer ? 'current-player' : ''} clickable-avatar`}
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
      <div className={`player-seat-position player-seat-position-${player.role}`}>{player.role}</div>
      <div className="player-seat-info">
        <div className="player-seat-name">
          [ {player.name} ]
          {player.isHuman && ' (You)'}
          {isMe && ' (Me)'}
        </div>
        <div className="player-seat-chips">
          {player.chips}
        </div>
        {!isMe && onSetAsMe && !hasMePlayer && (
          <button 
            className="set-as-me-btn"
            onClick={handleSetAsMe}
            title="设置为自己"
          >
            set me
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
            disabled={isButtonDisabled()}
          >
            Call
          </button>
          {canCheck && (
            <button
              className="player-seat-action-btn Check"
              onClick={(e) => handleActionClick('check', e)}
              title="check"
              disabled={isButtonDisabled()}
            >
              Check
            </button>
          )}
          <button 
            className="player-seat-action-btn raise"
            onClick={(e) => handleActionClick('raise', e)}
            title="加注"
            disabled={isButtonDisabled()}
          >
            Raise
          </button>
          <button 
            className="player-seat-action-btn fold"
            onClick={(e) => handleActionClick('fold', e)}
            title="弃牌"
            disabled={isButtonDisabled()}
          >
            Fold
          </button>
          <button 
            className="player-seat-action-btn allin"
            onClick={(e) => handleActionClick('allin', e)}
            title="全下"
            disabled={isButtonDisabled()}
          >
            All In
          </button>
          {isMe && (
            <button 
              className="player-seat-action-btn AskAI"
              onClick={() => onGetAIRecommendation()}
              title="AI Recommendation"
              disabled={isButtonDisabled()}
            >
              AskAI
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;
