import React, { useState } from 'react';
import styled from 'styled-components';
import { X, User, Coins } from 'lucide-react';

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
  max-width: 400px;
  width: 90%;
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
  font-size: 1.5rem;
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

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #d4c4a8;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
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

const AddPlayerDialog = ({ 
  onAddPlayer, 
  onCancel, 
  loading = false,
  maxPlayers = 8,
  currentPlayerCount = 0
}) => {
  const [playerName, setPlayerName] = useState('');
  const [initialChips, setInitialChips] = useState(1000);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && initialChips > 0) {
      onAddPlayer({
        name: playerName.trim(),
        chips: initialChips,
        isHuman: false, // AI players by default
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`
      });
      setPlayerName('');
      setInitialChips(1000);
    }
  };

  const canAddPlayer = currentPlayerCount < maxPlayers;

  return (
    <Overlay onClick={onCancel}>
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <User size={24} />
            Add Player
          </Title>
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>
        </Header>

        {!canAddPlayer && (
          <div style={{ 
            background: 'rgba(244, 67, 54, 0.2)', 
            border: '1px solid rgba(244, 67, 54, 0.5)', 
            borderRadius: '8px', 
            padding: '12px', 
            color: '#ffcdd2', 
            marginBottom: '20px', 
            textAlign: 'center' 
          }}>
            Maximum {maxPlayers} players reached
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Player Name</Label>
            <Input
              type="text"
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={!canAddPlayer || loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Initial Chips</Label>
            <Input
              type="number"
              placeholder="Enter initial chips"
              value={initialChips}
              onChange={(e) => setInitialChips(parseInt(e.target.value) || 0)}
              min="1"
              disabled={!canAddPlayer || loading}
              required
            />
          </FormGroup>

          <ActionButtons>
            <ActionButton 
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </ActionButton>
            <ActionButton 
              type="submit"
              className="btn-primary"
              disabled={!canAddPlayer || loading || !playerName.trim() || initialChips <= 0}
            >
              {loading ? 'Adding...' : 'Add Player'}
            </ActionButton>
          </ActionButtons>
        </form>
      </DialogCard>
    </Overlay>
  );
};

export default AddPlayerDialog;
