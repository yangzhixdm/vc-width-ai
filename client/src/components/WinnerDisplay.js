import React from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import './WinnerDisplay.css';

const WinnerDisplay = ({ 
  winner, 
  pot, 
  handEvaluations = [], 
  showWinner, 
  onClose 
}) => {
  if (!showWinner || !winner) {
    return null;
  }

  const getHandRankDisplay = (rank) => {
    switch (rank) {
      case 8: return '四条';
      case 7: return '葫芦';
      case 6: return '同花顺';
      case 5: return '同花';
      case 4: return '三条';
      case 3: return '两对';
      case 2: return '一对';
      case 1: return '高牌';
      default: return '未知';
    }
  };

  return (
    <div className="winner-display-overlay" onClick={onClose}>
      <div className="winner-display-card" onClick={(e) => e.stopPropagation()}>
        <div className="winner-display-header">
          <div className="winner-display-icon">
            <Trophy size={32} color="white" />
          </div>
          <h2 className="winner-display-title">游戏结束</h2>
          <button className="winner-display-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="winner-display-content">
          <div className="winner-info">
            <div className="winner-avatar">
              <Star size={24} color="white" />
            </div>
            <div className="winner-details">
              <div className="winner-name">{winner.name}</div>
              <div className="winner-label">获胜者</div>
            </div>
          </div>

          <div className="pot-info">
            <div className="pot-amount">${pot}</div>
            <div className="pot-label">奖池</div>
          </div>

          {handEvaluations.length > 0 && (
            <div className="hand-evaluations">
              <h3 className="evaluations-title">手牌排名</h3>
              <div className="evaluations-list">
                {handEvaluations.map((evaluation, index) => (
                  <div 
                    key={evaluation.player.id} 
                    className={`evaluation-item ${index === 0 ? 'winner' : ''}`}
                  >
                    <div className="evaluation-rank">#{index + 1}</div>
                    <div className="evaluation-player">{evaluation.player.name}</div>
                    <div className="evaluation-hand">{getHandRankDisplay(evaluation.handRank)}</div>
                    {index === 0 && (
                      <div className="evaluation-crown">
                        <Award size={16} color="#ffd700" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="winner-display-actions">
          <button className="winner-display-btn" onClick={onClose}>
            继续游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;
