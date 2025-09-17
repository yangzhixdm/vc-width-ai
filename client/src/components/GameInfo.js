import React from 'react';
import { Users, Clock } from 'lucide-react';
import './GameInfo.css';

const GameInfo = ({ game, players = [], onAddPlayer, onBlindSettings, onButtonPosition, loading }) => {
  const activePlayers = players.filter(p => p.isActive && !p.isFolded).length;

  const getRoundDisplay = (round) => {
    switch (round) {
      case 'preflop': return 'Pre-Flop';
      case 'flop': return 'Flop';
      case 'turn': return 'Turn';
      case 'river': return 'River';
      case 'showdown': return 'Showdown';
      default: return round;
    }
  };

  return (
    <div className="game-info-container">
      {/* 桌子控制按钮 */}
      <div className="game-table-table-controls">
        <button 
          className="game-table-control-button add-player"
          onClick={onAddPlayer}
          disabled={loading || players.length >= 8}
          title="Add Player"
        >
          +
        </button>
        <button 
          className="game-table-control-button settings"
          onClick={onBlindSettings}
          disabled={loading}
          title="Blind Settings"
        >
          ⚙
        </button>
        <button 
          className="game-table-control-button button-position"
          onClick={onButtonPosition}
          disabled={loading || players.length < 2}
          title="Set Button Position"
        >
          🎯
        </button>
      </div>
    </div>
  );
};

export default GameInfo;
