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

const Title = styled.h2`
  color: #f4e4bc;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
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

const Select = styled.select`
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

  option {
    background: #1a5f4a;
    color: white;
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

const PlayerList = styled.div`
  margin-top: 20px;
`;

const PlayerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
`;

const RemoveButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #d32f2f;
  }
`;

const GameSetup = ({ onGameStart }) => {
  const { createGame, addPlayer, startGame, loading, error } = useGame();
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameId, setGameId] = useState(null);

  const handleCreateGame = async () => {
    try {
      const game = await createGame(smallBlind, bigBlind);
      setGameId(game.id);
    } catch (err) {
      console.error('Failed to create game:', err);
    }
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim() || !gameId) return;

    try {
      const playerData = {
        name: playerName.trim(),
        isHuman: players.length === 0, // First player is human
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`
      };

      await addPlayer(gameId, playerData);
      setPlayers([...players, { ...playerData, id: Date.now() }]);
      setPlayerName('');
    } catch (err) {
      console.error('Failed to add player:', err);
    }
  };

  const handleRemovePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleStartGame = async () => {
    if (!gameId || players.length < 2) return;

    try {
      await startGame(gameId);
      onGameStart(gameId);
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  return (
    <SetupContainer>
      <SetupCard>
        <Title>🎮 Game Setup</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {!gameId ? (
          <>
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
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </>
        ) : (
          <>
            <FormGroup>
              <Label>Add Player</Label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Input
                  type="text"
                  placeholder="Player name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                <Button 
                  onClick={handleAddPlayer} 
                  disabled={!playerName.trim() || loading}
                  style={{ width: 'auto', padding: '12px 20px' }}
                >
                  Add
                </Button>
              </div>
            </FormGroup>

            <PlayerList>
              <Label>Players ({players.length}/8)</Label>
              {players.map((player, index) => (
                <PlayerItem key={player.id}>
                  <span>{player.name} {player.isHuman ? '(You)' : ''}</span>
                  <RemoveButton onClick={() => handleRemovePlayer(index)}>
                    Remove
                  </RemoveButton>
                </PlayerItem>
              ))}
            </PlayerList>

            <Button 
              onClick={handleStartGame} 
              disabled={players.length < 2 || loading}
            >
              {loading ? 'Starting...' : `Start Game (${players.length} players)`}
            </Button>
          </>
        )}
      </SetupCard>
    </SetupContainer>
  );
};

export default GameSetup;
