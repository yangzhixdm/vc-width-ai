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
    <div className="player-seat-container-wrapper">
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
            {canCheck ? (
              <button
                className="player-seat-action-btn check"
                onClick={(e) => handleActionClick('check', e)}
                title="check"
                disabled={isButtonDisabled()}
              >
                Check
              </button>
            ) : (
              <button 
                className="player-seat-action-btn call"
                onClick={(e) => handleActionClick('call', e)}
                title="跟注"
                disabled={isButtonDisabled()}
              >
                Call
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

      {/* 下注筹码显示区域 - 放在玩家和桌子中心之间的直线上 */}
      {player.currentBet > 0 && (() => {
        // 桌子中心位置
        const tableCenterX = 400;
        const tableCenterY = 300;
        
        // 玩家位置
        const playerX = position.x;
        const playerY = position.y;
        
        // 计算从玩家到桌子中心的向量
        const deltaX = tableCenterX - playerX;
        const deltaY = tableCenterY - playerY;
        
        // 筹码位置：在玩家和桌子中心之间的中点
        const chipX = playerX + deltaX * 0.5;
        const chipY = playerY + deltaY * 0.5;
        
        return (
          <div 
            className="player-seat-bet-chips"
            style={{
              position: 'absolute',
              left: `${chipX}px`,
              top: `${chipY}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="player-seat-bet-amount">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" role="img" aria-label="3D green poker chip with dollar sign">
                <defs>
                  <radialGradient id="chipFill" cx="35%" cy="35%" r="70%">
                    <stop offset="0%"  stop-color="#4CAF50"/>
                    <stop offset="70%" stop-color="#2E7D32"/>
                    <stop offset="100%" stop-color="#1B5E20"/>
                  </radialGradient>

                  <linearGradient id="ringStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stop-color="#FFFFFF"/>
                    <stop offset="100%" stop-color="#C8E6C9"/>
                  </linearGradient>
                  <filter id="drop" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0.6" stdDeviation="0.7" flood-opacity="0.25"/>
                  </filter>
                  <clipPath id="chipClip"><circle cx="10" cy="10" r="9"/></clipPath>
                  <linearGradient id="innerStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stop-color="#E0E0E0"/>
                    <stop offset="100%" stop-color="#BDBDBD"/>
                  </linearGradient>
                </defs>

                <g filter="url(#drop)">
                  <circle cx="10" cy="10" r="9" fill="url(#chipFill)"/>
                  <circle cx="10" cy="10" r="7" fill="none" stroke="url(#ringStroke)" stroke-width="2"/>
                  <g stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="2" stroke-linecap="round">
                    <line x1="10" y1="2"  x2="10" y2="4"/>
                    <line x1="10" y1="16" x2="10" y2="18"/>
                    <line x1="2"  y1="10" x2="4"  y2="10"/>
                    <line x1="16" y1="10" x2="18" y2="10"/>
                    <line x1="15.3" y1="4.7" x2="16.4" y2="3.6"/>
                    <line x1="4.7"  y1="4.7" x2="3.6"  y2="3.6"/>
                    <line x1="4.7"  y1="15.3" x2="3.6"  y2="16.4"/>
                    <line x1="15.3" y1="15.3" x2="16.4" y2="16.4"/>
                  </g>
                  <circle cx="10" cy="10" r="4.2" fill="#FFFFFF" stroke="url(#innerStroke)" stroke-width="0.6"/>
                  <text x="10" y="12.8" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="6.2" font-weight="700" fill="#2E7D32">$</text>
                  <g clip-path="url(#chipClip)" opacity="0.35">
                    <path d="M -2,6 C 3,1 17,1 22,6 L 22,2 L -2,2 Z" fill="#FFFFFF"/>
                  </g>
                </g>
              </svg>
              {player.currentBet}
            </div>
          </div>
        );
      })()}

      {/* 手牌显示区域 - 只显示自己的手牌，放在玩家和桌子中心之间的直线上 */}
      {(() => {
        // 桌子中心位置
        const tableCenterX = 400;
        const tableCenterY = 300;
        
        // 玩家位置
        const playerX = position.x;
        const playerY = position.y;
        
        // 计算从玩家到桌子中心的向量
        const deltaX = tableCenterX - playerX;
        const deltaY = tableCenterY - playerY;
        
        // 手牌位置：在玩家和桌子中心之间的1/3位置（更靠近玩家）
        const cardX = playerX + deltaX * 0.3;
        const cardY = playerY + deltaY * 0.3;
        
        return (
          <div 
            className="player-seat-hole-cards"
            style={{
              position: 'absolute',
              left: `${cardX}px`,
              top: `${cardY}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {player.holeCards && player.holeCards.length > 0 ? (
              <div className="player-seat-hole-cards-display">
                {player.holeCards.map((card, index) => (
                  <div key={index} className="player-seat-hole-card">
                    <div className="card-value">{card.value}</div>
                    <div className={`card-suit ${card.suit}`}>
                      {card.suit === 'hearts' ? '♥' : 
                      card.suit === 'diamonds' ? '♦' : 
                      card.suit === 'clubs' ? '♣' : 
                      card.suit === 'spades' ? '♠' : card.suit}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="player-seat-set-cards-btn">
                <button 
                  className="set-cards-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSetPlayerHoleCards) {
                      onSetPlayerHoleCards(player);
                    }
                  }}
                  title="设置手牌"
                >
                  设置手牌
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default PlayerSeat;
