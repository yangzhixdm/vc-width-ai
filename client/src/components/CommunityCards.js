import React from 'react';
import styled from 'styled-components';

const CardsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 80px;
`;

const Card = styled.div`
  width: 50px;
  height: 70px;
  border-radius: 8px;
  background: ${props => props.isPlaceholder 
    ? 'linear-gradient(135deg, #2d7a5f 0%, #1a5f4a 100%)' 
    : 'white'
  };
  border: 2px solid ${props => props.isPlaceholder ? '#2d7a5f' : '#333'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.isPlaceholder ? '#2d7a5f' : '#333'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }
`;

const CardValue = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.suit === 'hearts' || props.suit === 'diamonds' ? '#e74c3c' : '#2c3e50'};
`;

const CardSuit = styled.div`
  font-size: 16px;
  color: ${props => props.suit === 'hearts' || props.suit === 'diamonds' ? '#e74c3c' : '#2c3e50'};
`;

const PlaceholderText = styled.div`
  font-size: 10px;
  text-align: center;
  opacity: 0.7;
`;

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
    <CardsContainer>
      {cards.map((card, index) => {
        const cardDisplay = getCardDisplay(card);
        if (!cardDisplay) return null;

        return (
          <Card key={index}>
            <CardValue suit={cardDisplay.suit}>
              {cardDisplay.value}
            </CardValue>
            <CardSuit suit={cardDisplay.suit}>
              {cardDisplay.symbol}
            </CardSuit>
          </Card>
        );
      })}
      
      {Array.from({ length: placeholderCount }, (_, index) => (
        <Card key={`placeholder-${index}`} isPlaceholder>
          <PlaceholderText>
            {cards.length === 0 ? 'Pre-flop' : 
             cards.length === 3 ? 'Turn' :
             cards.length === 4 ? 'River' : 'Card'}
          </PlaceholderText>
        </Card>
      ))}
    </CardsContainer>
  );
};

export default CommunityCards;
