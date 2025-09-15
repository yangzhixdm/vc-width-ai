import React from 'react';
import './CommunityCards.css';

const getSuitSymbol = (suit) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '?';
  }
};

const getCardDisplay = (card) => {
  if (!card) return null;
  
  return {
    value: card.value,
    suit: card.suit,
    symbol: getSuitSymbol(card.suit)
  };
};

const CommunityCards = ({ cards = [] }) => {
  const maxCards = 5;
  const placeholderCount = Math.max(0, maxCards - cards.length);

  return (
    <div className="community-cards-container">
      {cards.map((card, index) => {
        const cardDisplay = getCardDisplay(card);
        if (!cardDisplay) return null;

        return (
          <div key={index} className="community-card">
            <div className={`community-card-value ${cardDisplay.suit}`}>
              {cardDisplay.value}
            </div>
            <div className={`community-card-suit ${cardDisplay.suit}`}>
              {cardDisplay.symbol}
            </div>
          </div>
        );
      })}
      
      {Array.from({ length: placeholderCount }, (_, index) => (
        <div key={`placeholder-${index}`} className="community-card placeholder">
          <div className="community-card-placeholder-text">
            {cards.length === 0 ? 'Pre-flop' : 
             cards.length === 3 ? 'Turn' :
             cards.length === 4 ? 'River' : 'Card'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityCards;
