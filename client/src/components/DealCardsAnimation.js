import React, { useEffect, useState } from 'react';
import './DealCardsAnimation.css';

const DealCardsAnimation = ({ 
  players = [], 
  isVisible = false, 
  onComplete,
  myPlayerIndex = -1
}) => {
  const [animationState, setAnimationState] = useState('idle');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    if (isVisible && players.length > 0) {
      setAnimationState('animating');
      setCurrentCardIndex(0);
      setCurrentPlayerIndex(0);
      
      // 开始发牌动画
      startDealingAnimation();
    }
  }, [isVisible, players]);

  const startDealingAnimation = () => {
    const totalCards = players.length * 2; // 每个玩家2张牌
    let cardIndex = 0;
    let playerIndex = 0;
    let cardInHand = 0; // 0 或 1，表示当前玩家的第几张牌

    const dealNextCard = () => {
      if (cardIndex >= totalCards) {
        // 所有牌发完
        setAnimationState('completed');
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 500);
        return;
      }

      setCurrentCardIndex(cardIndex);
      setCurrentPlayerIndex(playerIndex);

      // 计算下一张牌
      cardInHand++;
      if (cardInHand >= 2) {
        cardInHand = 0;
        playerIndex++;
      }
      cardIndex++;

      // 延迟发下一张牌
      setTimeout(dealNextCard, 300); // 每张牌间隔300ms
    };

    // 开始发第一张牌
    setTimeout(dealNextCard, 200);
  };

  if (!isVisible || !players.length || animationState === 'idle') {
    return null;
  }

  // 计算玩家位置（与GameTable中的逻辑保持一致）
  const getAdjustedPlayerPosition = (index, totalPlayers, myPlayerIndex) => {
    if (myPlayerIndex === -1) {
      return getPlayerPosition(index, totalPlayers);
    }
    
    const myOriginalAngle = (360 / totalPlayers) * myPlayerIndex;
    const rotationAngle = 180 - myOriginalAngle;
    
    const angle = (360 / totalPlayers) * index;
    const adjustedAngle = angle + rotationAngle;
    const radius = 380;
    const x = Math.cos((adjustedAngle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((adjustedAngle - 90) * Math.PI / 180) * radius;
    
    return {
      x: x + 400,
      y: y + 300,
      angle: adjustedAngle
    };
  };

  const getPlayerPosition = (index, totalPlayers) => {
    let angle;
    
    if (totalPlayers === 2) {
      angle = index === 0 ? 0 : 180;
    } else if (totalPlayers === 3) {
      angle = index === 0 ? 0 : (index === 1 ? 120 : 240);
    } else if (totalPlayers === 4) {
      angle = index * 90;
    } else if (totalPlayers === 5) {
      angle = index * 72;
    } else if (totalPlayers === 6) {
      angle = index * 60;
    } else if (totalPlayers === 7) {
      angle = index * (360 / 7);
    } else if (totalPlayers === 8) {
      angle = index * 45;
    } else {
      angle = (360 / totalPlayers) * index;
    }
    
    const radius = 380;
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
    
    return {
      x: x + 400,
      y: y + 300,
      angle: angle
    };
  };

  // 底池位置（桌子中心）
  const potPosition = { x: 400, y: 300 };

  // 计算当前正在飞的牌的目标位置
  const getCurrentCardTarget = () => {
    if (currentPlayerIndex >= players.length) return potPosition;
    
    const playerPosition = getAdjustedPlayerPosition(currentPlayerIndex, players.length, myPlayerIndex);
    
    // 计算手牌位置（在玩家和桌子中心之间的1/3位置）
    const deltaX = playerPosition.x - potPosition.x;
    const deltaY = playerPosition.y - potPosition.y;
    
    // 根据是第几张牌调整位置
    const cardOffset = currentCardIndex % 2 === 0 ? -15 : 15; // 第一张牌偏左，第二张牌偏右
    
    return {
      x: playerPosition.x + deltaX * 0.35 + cardOffset,
      y: playerPosition.y + deltaY * 0.35
    };
  };

  const currentTarget = getCurrentCardTarget();

  return (
    <div className="deal-cards-animation-container">
      <div 
        className={`deal-card ${animationState}`}
        style={{
          '--start-x': `${potPosition.x}px`,
          '--start-y': `${potPosition.y}px`,
          '--end-x': `${currentTarget.x}px`,
          '--end-y': `${currentTarget.y}px`,
        }}
      >
        <div className="card">
          <div className="card-back">
            <div className="card-pattern"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCardsAnimation;
