import React, { useState } from 'react';
import styled from 'styled-components';
import { useGame } from '../hooks/useGame';

const SetupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 600px;
  width: 100%;
`;

const SetupCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
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

const Button = styled.button`
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);

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

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  padding: 12px;
  color: #ffcdd2;
  margin-bottom: 20px;
  text-align: center;
`;



const GameSetup = ({ onGameStart }) => {
  const { createGame, loading, error } = useGame();
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);

  const handleCreateGame = async () => {
    try {
      const game = await createGame(smallBlind, bigBlind);
      onGameStart(game.id);
    } catch (err) {
      console.error('Failed to create game:', err);
    }
  };

  return (
    <SetupContainer>
      <SetupCard>
        <h2 style={{ color: '#f4e4bc', textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem' }}>
          🎮 Create New Game
        </h2>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <Label>Small Blind</Label>
          <Input
            type="number"
            value={smallBlind}
            onChange={(e) => setSmallBlind(parseInt(e.target.value) || 10)}
            min="1"
          />
        </FormGroup>

        <FormGroup>
          <Label>Big Blind</Label>
          <Input
            type="number"
            value={bigBlind}
            onChange={(e) => setBigBlind(parseInt(e.target.value) || 20)}
            min="1"
          />
        </FormGroup>

        <Button onClick={handleCreateGame} disabled={loading}>
          {loading ? 'Creating...' : 'Create Game & Enter Table'}
        </Button>
      </SetupCard>
    </SetupContainer>
  );
};

export default GameSetup;
