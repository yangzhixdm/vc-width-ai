import React, { useEffect, useState } from 'react';
import './FlipCardsAnimation.css';

const FlipCardsAnimation = ({ 
  cards = [], 
  isVisible = false, 
  onComplete,
  round = 'flop' // 'flop', 'turn', 'river'
}) => {
  const [animationState, setAnimationState] = useState('idle');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (isVisible && cards.length > 0) {
      setAnimationState('animating');
      setCurrentCardIndex(0);
      
      // 开始翻牌动画
      startFlipAnimation();
    }
  }, [isVisible, cards, round]);

  const startFlipAnimation = () => {
    const cardsToFlip = getCardsToFlip();
    let cardIndex = 0;

    const flipNextCard = () => {
      if (cardIndex >= cardsToFlip) {
        // 所有牌翻完
        setAnimationState('completed');
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 500);
        return;
      }

      setCurrentCardIndex(cardIndex);
      cardIndex++;

      // 延迟翻下一张牌
      setTimeout(flipNextCard, 400); // 每张牌间隔400ms
    };

    // 开始翻第一张牌
    setTimeout(flipNextCard, 200);
  };

  const getCardsToFlip = () => {
    switch (round) {
      case 'flop':
        return 3; // 翻牌阶段翻3张牌
      case 'turn':
        return 1; // 转牌阶段翻1张牌
      case 'river':
        return 1; // 河牌阶段翻1张牌
      default:
        return 1;
    }
  };

  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  if (!isVisible || !cards.length || animationState === 'idle') {
    return null;
  }

  const cardsToFlip = getCardsToFlip();
  const startCardIndex = cards.length - cardsToFlip; // 从最后几张牌开始翻

  return (
    <div className="flip-cards-animation-container">
      {Array.from({ length: cardsToFlip }, (_, index) => {
        const cardIndex = startCardIndex + index;
        const card = cards[cardIndex];
        const isCurrentCard = index === currentCardIndex;
        
        if (!card) return null;

        return (
          <div 
            key={cardIndex}
            className={`flip-card ${isCurrentCard ? 'flipping' : ''} ${animationState}`}
            style={{
              '--card-index': index,
              '--total-cards': cardsToFlip
            }}
          >
            <div className="card-container">
              {/* 牌背面 */}
              <div className="card-back">
                <div className="card-pattern"></div>
              </div>
              
              {/* 牌正面 */}
              <div className="card-front">
                <div className={`card-value ${card.suit}`}>
                  {card.value}
                </div>
                <div className={`card-suit ${card.suit}`}>
                  {getSuitSymbol(card.suit)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FlipCardsAnimation;
