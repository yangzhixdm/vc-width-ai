import React, { useState } from 'react';
import styled from 'styled-components';
import CardSelector from './CardSelector';
import { Cards, User } from 'lucide-react';

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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const Icon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
`;

const Title = styled.h2`
  color: #f4e4bc;
  margin: 0;
  font-size: 1.8rem;
`;

const PlayerInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const PlayerName = styled.div`
  color: #f4e4bc;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const PlayerPosition = styled.div`
  color: #d4c4a8;
  font-size: 1rem;
`;

const CardsDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const CardSlot = styled.div`
  width: 60px;
  height: 84px;
  border-radius: 8px;
  background: ${props => props.hasCard 
    ? 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border: 2px dashed ${props => props.hasCard ? '#4a9eff' : '#2d7a5f'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.hasCard ? 'white' : '#d4c4a8'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

  &.btn-select {
    background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
  }

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

const HoleCardsSelector = ({ 
  player, 
  onConfirm, 
  onCancel,
  usedCards = [] 
}) => {
  const [holeCards, setHoleCards] = useState(player.holeCards || []);
  const [showCardSelector, setShowCardSelector] = useState(false);

  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  const handleCardSelect = (selectedCards) => {
    setHoleCards(selectedCards);
    setShowCardSelector(false);
  };

  const handleConfirm = () => {
    if (holeCards.length === 2) {
      onConfirm(holeCards);
    }
  };

  const handleCardSlotClick = (index) => {
    if (holeCards[index]) {
      // 移除已选择的牌
      const newCards = [...holeCards];
      newCards.splice(index, 1);
      setHoleCards(newCards);
    } else {
      // 打开牌选择器
      setShowCardSelector(true);
    }
  };

  const canConfirm = holeCards.length === 2;

  if (showCardSelector) {
    return (
      <CardSelector
        title="选择手牌"
        maxCards={2 - holeCards.length}
        selectedCards={[]}
        onConfirm={handleCardSelect}
        onCancel={() => setShowCardSelector(false)}
        usedCards={[...usedCards, ...holeCards]}
      />
    );
  }

  return (
    <Overlay>
      <SelectorCard>
        <Header>
          <Icon>
            <User size={24} color="white" />
          </Icon>
          <Title>设置手牌</Title>
        </Header>

        <PlayerInfo>
          <PlayerName>{player.name}</PlayerName>
          <PlayerPosition>位置: {player.role} (第 {player.position + 1} 位)</PlayerPosition>
        </PlayerInfo>

        <CardsDisplay>
          {[0, 1].map(index => (
            <CardSlot
              key={index}
              hasCard={!!holeCards[index]}
              onClick={() => handleCardSlotClick(index)}
            >
              {holeCards[index] ? (
                <>
                  <CardValue suit={holeCards[index].suit}>
                    {holeCards[index].value}
                  </CardValue>
                  <CardSuit suit={holeCards[index].suit}>
                    {getSuitSymbol(holeCards[index].suit)}
                  </CardSuit>
                </>
              ) : (
                <div style={{ fontSize: '10px', textAlign: 'center' }}>
                  点击选择<br />第 {index + 1} 张牌
                </div>
              )}
            </CardSlot>
          ))}
        </CardsDisplay>

        <ActionButtons>
          <ActionButton 
            className="btn-select"
            onClick={() => setShowCardSelector(true)}
            disabled={holeCards.length >= 2}
          >
            <Cards size={20} />
            选择手牌
          </ActionButton>
          
          <ActionButton 
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            确认手牌
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

export default HoleCardsSelector;
