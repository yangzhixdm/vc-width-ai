import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGame } from '../hooks/useGame';
import { X, DollarSign } from 'lucide-react';

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

const BettingCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
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

const PlayerInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
`;

const PlayerName = styled.div`
  color: #f4e4bc;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const PlayerStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  color: #d4c4a8;
  font-size: 0.9rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
`;

const ActionButton = styled.button`
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.btn-check {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }

  &.btn-call {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
  }

  &.btn-raise {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
  }

  &.btn-fold {
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

const RaiseSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const RaiseTitle = styled.h3`
  color: #f4e4bc;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
`;

const PotSuggestions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const SuggestionButton = styled.button`
  padding: 10px 15px;
  border: 2px solid #2d7a5f;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #d4c4a8;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.1);
    color: white;
  }

  &.active {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.2);
    color: white;
  }
`;

const CustomAmount = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const AmountInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #2d7a5f;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const ConfirmButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const BettingInterface = ({ game, player, onAction, onClose }) => {
  const { getPotSizeSuggestions } = useGame();
  const [potSuggestions, setPotSuggestions] = useState({});
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPotSuggestions = async () => {
      try {
        const suggestions = await getPotSizeSuggestions(game.id);
        setPotSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load pot suggestions:', error);
      }
    };

    loadPotSuggestions();
  }, [game.id, getPotSizeSuggestions]);

  const handleAction = async (actionType, amount = 0) => {
    setLoading(true);
    try {
      await onAction(actionType, amount);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(parseInt(value) || 0);
  };

  const canCheck = game.currentBet === 0 || player.currentBet >= game.currentBet;
  const callAmount = Math.max(0, game.currentBet - player.currentBet);
  const minRaise = game.currentBet + (game.currentBet > 0 ? game.currentBet : game.bigBlind);

  return (
    <Overlay onClick={onClose}>
      <BettingCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Make Your Move</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <PlayerInfo>
          <PlayerName>{player.name}</PlayerName>
          <PlayerStats>
            <StatItem>
              <span>Chips:</span>
              <span>${player.chips}</span>
            </StatItem>
            <StatItem>
              <span>Current Bet:</span>
              <span>${player.currentBet}</span>
            </StatItem>
            <StatItem>
              <span>Pot:</span>
              <span>${game.currentPot}</span>
            </StatItem>
            <StatItem>
              <span>To Call:</span>
              <span>${callAmount}</span>
            </StatItem>
          </PlayerStats>
        </PlayerInfo>

        <ActionButtons>
          {canCheck ? (
            <ActionButton 
              className="btn-check"
              onClick={() => handleAction('check')}
              disabled={loading}
            >
              Check
            </ActionButton>
          ) : (
            <ActionButton 
              className="btn-call"
              onClick={() => handleAction('call', callAmount)}
              disabled={loading || callAmount > player.chips}
            >
              Call ${callAmount}
            </ActionButton>
          )}

          <ActionButton 
            className="btn-fold"
            onClick={() => handleAction('fold')}
            disabled={loading}
          >
            Fold
          </ActionButton>
        </ActionButtons>

        <RaiseSection>
          <RaiseTitle>Raise Amount</RaiseTitle>
          
          <PotSuggestions>
            {Object.entries(potSuggestions).map(([label, amount]) => (
              <SuggestionButton
                key={label}
                className={selectedAmount === amount ? 'active' : ''}
                onClick={() => handleSuggestionClick(amount)}
              >
                {label}: ${amount}
              </SuggestionButton>
            ))}
          </PotSuggestions>

          <CustomAmount>
            <AmountInput
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              min={minRaise}
              max={player.chips}
            />
            <ConfirmButton
              onClick={() => handleAction('raise', selectedAmount)}
              disabled={loading || selectedAmount < minRaise || selectedAmount > player.chips}
            >
              <DollarSign size={16} />
            </ConfirmButton>
          </CustomAmount>
        </RaiseSection>
      </BettingCard>
    </Overlay>
  );
};

export default BettingInterface;
