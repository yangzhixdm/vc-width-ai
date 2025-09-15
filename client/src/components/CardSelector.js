import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Check } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const SelectorCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #f4e4bc;
  margin: 0;
  font-size: 1.8rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #d4c4a8;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const SuitSection = styled.div`
  margin-bottom: 30px;
`;

const SuitTitle = styled.h3`
  color: #d4c4a8;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  width: 50px;
  height: 70px;
  border-radius: 8px;
  background: ${props => props.isSelected 
    ? 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)' 
    : 'white'
  };
  border: 2px solid ${props => props.isSelected ? '#4a9eff' : '#333'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.isSelected ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: #ccc;
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

const SelectedCards = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
`;

const SelectedTitle = styled.h4`
  color: #f4e4bc;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
`;

const SelectedCardsList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const SelectedCard = styled.div`
  width: 40px;
  height: 56px;
  border-radius: 6px;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  border: 2px solid #4a9eff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #d32f2f;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.btn-confirm {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }

  &.btn-cancel {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const CardSelector = ({ 
  title, 
  maxCards, 
  selectedCards = [], 
  onConfirm, 
  onCancel,
  usedCards = [] 
}) => {
  const [localSelectedCards, setLocalSelectedCards] = useState(selectedCards);

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  const isCardUsed = (suit, value) => {
    return usedCards.some(card => card.suit === suit && card.value === value);
  };

  const isCardSelected = (suit, value) => {
    return localSelectedCards.some(card => card.suit === suit && card.value === value);
  };

  const handleCardClick = (suit, value) => {
    if (isCardUsed(suit, value)) return;

    const card = { suit, value };
    const isSelected = isCardSelected(suit, value);

    if (isSelected) {
      // 取消选择
      setLocalSelectedCards(prev => prev.filter(c => !(c.suit === suit && c.value === value)));
    } else if (localSelectedCards.length < maxCards) {
      // 选择卡片
      setLocalSelectedCards(prev => [...prev, card]);
    }
  };

  const handleRemoveCard = (suit, value) => {
    setLocalSelectedCards(prev => prev.filter(c => !(c.suit === suit && c.value === value)));
  };

  const handleConfirm = () => {
    if (localSelectedCards.length === maxCards) {
      onConfirm(localSelectedCards);
    }
  };

  const canConfirm = localSelectedCards.length === maxCards;

  return (
    <Overlay>
      <SelectorCard>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>
        </Header>

        <SelectedCards>
          <SelectedTitle>
            已选择 ({localSelectedCards.length}/{maxCards})
          </SelectedTitle>
          <SelectedCardsList>
            {localSelectedCards.map((card, index) => (
              <SelectedCard key={index}>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '12px' }}>
                  {getSuitSymbol(card.suit)}
                </div>
                <RemoveButton onClick={() => handleRemoveCard(card.suit, card.value)}>
                  ×
                </RemoveButton>
              </SelectedCard>
            ))}
          </SelectedCardsList>
        </SelectedCards>

        {suits.map(suit => (
          <SuitSection key={suit}>
            <SuitTitle>{suit.toUpperCase()}</SuitTitle>
            <CardsGrid>
              {values.map(value => {
                const isSelected = isCardSelected(suit, value);
                const isUsed = isCardUsed(suit, value);
                const isDisabled = isUsed || (!isSelected && localSelectedCards.length >= maxCards);

                return (
                  <Card
                    key={`${suit}-${value}`}
                    isSelected={isSelected}
                    className={isDisabled ? 'disabled' : ''}
                    onClick={() => handleCardClick(suit, value)}
                  >
                    <CardValue suit={suit}>
                      {value}
                    </CardValue>
                    <CardSuit suit={suit}>
                      {getSuitSymbol(suit)}
                    </CardSuit>
                  </Card>
                );
              })}
            </CardsGrid>
          </SuitSection>
        ))}

        <ActionButtons>
          <ActionButton 
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            <Check size={20} />
            确认选择 ({localSelectedCards.length}/{maxCards})
          </ActionButton>
          
          <ActionButton 
            className="btn-cancel"
            onClick={onCancel}
          >
            取消
          </ActionButton>
        </ActionButtons>
      </SelectorCard>
    </Overlay>
  );
};

export default CardSelector;
