import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GameTable from './components/GameTable';
import GameSetup from './components/GameSetup';
import { GameProvider } from './hooks/useGame';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <GameProvider>
        <Router>
          <Routes>
            <Route path="/" element={<GameSetup />} />
            <Route path="/game/:gameId" element={<GameTable />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </GameProvider>
    </div>
  );
}

export default App;
