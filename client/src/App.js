import React, { useState } from 'react';
import styled from 'styled-components';
import GameTable from './components/GameTable';
import GameSetup from './components/GameSetup';
import { GameProvider } from './hooks/useGame';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f4c3a 0%, #1a5f4a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #f4e4bc;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

function App() {
  const [gameId, setGameId] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);

  const handleEnterGameTable = (newGameId) => {
    setGameId(newGameId);
    setIsGameActive(true);
  };

  const handleExitGameTable = () => {
    setGameId(null);
    setIsGameActive(false);
  };

  return (
    <AppContainer>
      <Header>
        <Title>AI Assistant</Title>
      </Header>
      
      <GameProvider>
        {!isGameActive ? (
          <GameSetup onGameStart={handleEnterGameTable} />
        ) : (
          <GameTable 
            gameId={gameId} 
            onGameEnd={handleExitGameTable}
          />
        )}
      </GameProvider>
    </AppContainer>
  );
}

export default App;
