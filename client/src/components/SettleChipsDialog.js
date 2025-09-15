import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Trophy, Coins } from 'lucide-react';

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

const DialogCard = styled.div`
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
  display: flex;
  align-items: center;
  gap: 10px;
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

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const PlayerItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(74, 158, 255, 0.3);
  }

  &.selected {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.1);
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PlayerAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.avatar ? `url(${props.avatar})` : 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)'};
  background-size: cover;
  background-position: center;
  border: 2px solid #2d7a5f;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const PlayerName = styled.div`
  color: #f4e4bc;
  font-size: 1.1rem;
  font-weight: 600;
`;

const PlayerChips = styled.div`
  color: #4a9eff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PotInfo = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const PotAmount = styled.div`
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const PotLabel = styled.div`
  color: #d4c4a8;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.btn-primary {
    background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
  }

  &.btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
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

const SettleChipsDialog = ({ 
  players, 
  potAmount, 
  onSettle, 
  onCancel, 
  loading = false 
}) => {
  const [selectedWinner, setSelectedWinner] = useState(null);

  const handleSettle = () => {
    if (selectedWinner) {
      onSettle(selectedWinner.id);
    }
  };

  return (
    <Overlay onClick={onCancel}>
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Trophy size={24} />
            Settle Chips
          </Title>
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>
        </Header>

        <PotInfo>
          <PotAmount>
            <Coins size={20} style={{ marginRight: '8px' }} />
            ${potAmount}
          </PotAmount>
          <PotLabel>Total Pot to Award</PotLabel>
        </PotInfo>

        <PlayerList>
          {players.map((player) => (
            <PlayerItem
              key={player.id}
              className={selectedWinner?.id === player.id ? 'selected' : ''}
              onClick={() => setSelectedWinner(player)}
            >
              <PlayerInfo>
                <PlayerAvatar avatar={player.avatar} />
                <PlayerDetails>
                  <PlayerName>
                    {player.name}
                    {player.isHuman && ' (You)'}
                  </PlayerName>
                  <PlayerChips>
                    <Coins size={14} />
                    ${player.chips}
                  </PlayerChips>
                </PlayerDetails>
              </PlayerInfo>
            </PlayerItem>
          ))}
        </PlayerList>

        <ActionButtons>
          <ActionButton 
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            className="btn-primary"
            onClick={handleSettle}
            disabled={!selectedWinner || loading}
          >
            {loading ? 'Settling...' : 'Award Pot'}
          </ActionButton>
        </ActionButtons>
      </DialogCard>
    </Overlay>
  );
};

export default SettleChipsDialog;
