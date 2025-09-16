import React from 'react';
import { CreditCard, Clock, Trophy, Users } from 'lucide-react';
import './GameStatusDisplay.css';

const GameStatusDisplay = ({ game, players = [] }) => {
  const getRoundDisplay = (round) => {
    switch (round) {
      case 'preflop': return '翻牌前';
      case 'flop': return '翻牌';
      case 'turn': return '转牌';
      case 'river': return '河牌';
      case 'showdown': return '摊牌';
      default: return round;
    }
  };

  const getRoundIcon = (round) => {
    switch (round) {
      case 'preflop': return <Users size={20} color="white" />;
      case 'flop': return <CreditCard size={20} color="white" />;
      case 'turn': return <Clock size={20} color="white" />;
      case 'river': return <CreditCard size={20} color="white" />;
      case 'showdown': return <Trophy size={20} color="white" />;
      default: return <CreditCard size={20} color="white" />;
    }
  };

  const getRoundColor = (round) => {
    switch (round) {
      case 'preflop': return '#4caf50';
      case 'flop': return '#ff9800';
      case 'turn': return '#2196f3';
      case 'river': return '#9c27b0';
      case 'showdown': return '#f44336';
      default: return '#607d8b';
    }
  };

  const activePlayers = players.filter(p => p.isActive && !p.isFolded).length;
  const totalPlayers = players.length;

  return (
    <div className="game-status-display">
      <div className="game-status-card">
        <div 
          className="game-status-icon"
          style={{ backgroundColor: getRoundColor(game?.currentRound || 'preflop') }}
        >
          {getRoundIcon(game?.currentRound || 'preflop')}
        </div>
        <div className="game-status-content">
          <div className="game-status-value">
            {getRoundDisplay(game?.currentRound || 'preflop')}
            {game?.handNumber && (
              <div className="game-status-hand-number">第{game.handNumber}手</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatusDisplay;
