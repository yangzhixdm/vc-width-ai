import React from 'react';
import { Users, DollarSign, Clock, Target } from 'lucide-react';
import './GameInfo.css';

const GameInfo = ({ game, players = [] }) => {
  const activePlayers = players.filter(p => p.isActive && !p.isFolded).length;
  const totalChips = players.reduce((sum, player) => sum + player.chips, 0);
  const currentBet = game?.currentBet || 0;
  const pot = game?.currentPot || 0;

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
      <div className="game-info-card">
        <div className="game-info-icon">
          <Users size={20} color="white" />
        </div>
        <div className="game-info-content">
          <div className="game-info-label">Active Players</div>
          <div className="game-info-value">{activePlayers}/{players.length}</div>
        </div>
      </div>

      <div className="game-info-card">
        <div className="game-info-icon">
          <DollarSign size={20} color="white" />
        </div>
        <div className="game-info-content">
          <div className="game-info-label">Total Chips</div>
          <div className="game-info-value">${totalChips}</div>
        </div>
      </div>

      <div className="game-info-card">
        <div className="game-info-icon">
          <Target size={20} color="white" />
        </div>
        <div className="game-info-content">
          <div className="game-info-label">Current Bet</div>
          <div className="game-info-value">${currentBet}</div>
        </div>
      </div>

      <div className="game-round-info">
        <div className="game-round-icon">
          <Clock size={20} color="white" />
        </div>
        <div className="game-round-value">{getRoundDisplay(game?.currentRound || 'preflop')}</div>
      </div>
    </div>
  );
};

export default GameInfo;
