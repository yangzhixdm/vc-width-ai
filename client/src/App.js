import React, { useState } from 'react';
import GameTable from './components/GameTable';
import GameSetup from './components/GameSetup';
import { GameProvider } from './hooks/useGame';
import './App.css';

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
    <div className="app-container">
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
    </div>
  );
}

export default App;
