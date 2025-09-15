import React from 'react';
import { useGame } from '../hooks/useGame';
import { Brain, Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './AIRecommendation.css';

const AIRecommendation = ({ onAccept, onReject }) => {
  const { aiRecommendation } = useGame();

  if (!aiRecommendation) {
    return null;
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'check': return '✓';
      case 'call': return '📞';
      case 'raise': return '📈';
      case 'fold': return '✕';
      default: return '?';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 75) return '#4caf50';
    if (confidence >= 50) return '#ff9800';
    return '#f44336';
  };

  const handleAccept = () => {
    onAccept(aiRecommendation.action, aiRecommendation.amount || 0);
  };

  return (
    <div className="ai-recommendation-overlay">
      <div className="ai-recommendation-card">
        <div className="ai-recommendation-header">
          <div className="ai-recommendation-brain-icon">
            <Brain size={24} color="white" />
          </div>
          <h2 className="ai-recommendation-title">AI Recommendation</h2>
        </div>

        <div className="ai-recommendation-section">
          <div className="ai-recommendation-action">
            <div className={`ai-recommendation-action-icon ${aiRecommendation.action}`}>
              {getActionIcon(aiRecommendation.action)}
            </div>
            <div className="ai-recommendation-action-text">{aiRecommendation.action}</div>
          </div>

          {aiRecommendation.amount > 0 && (
            <div className="ai-recommendation-confidence" style={{ color: '#4a9eff', fontSize: '1.2rem', fontWeight: '600', marginTop: '10px' }}>
              ${aiRecommendation.amount}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <div className="ai-recommendation-confidence" style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <TrendingUp size={16} />
              Confidence Level
            </div>
            <div className="ai-recommendation-confidence-bar">
              <div 
                className="ai-recommendation-confidence-fill"
                style={{ 
                  width: `${aiRecommendation.confidence}%`,
                  background: `linear-gradient(90deg, 
                    ${aiRecommendation.confidence < 50 ? '#f44336' : 
                      aiRecommendation.confidence < 75 ? '#ff9800' : '#4caf50'} 0%, 
                    ${aiRecommendation.confidence < 50 ? '#d32f2f' : 
                      aiRecommendation.confidence < 75 ? '#f57c00' : '#388e3c'} 100%)`
                }}
              >
                {aiRecommendation.confidence}%
              </div>
            </div>
          </div>

          {aiRecommendation.reasoning && (
            <div className="ai-recommendation-reasoning">
              <div className="ai-recommendation-reasoning-title">
                <Brain size={16} />
                AI Analysis
              </div>
              <div className="ai-recommendation-reasoning-text">
                {aiRecommendation.reasoning}
              </div>
            </div>
          )}
        </div>

        <div className="ai-recommendation-buttons">
          <button 
            className="ai-recommendation-button accept"
            onClick={handleAccept}
          >
            <Check size={20} />
            Accept Recommendation
          </button>
          
          <button 
            className="ai-recommendation-button reject"
            onClick={onReject}
          >
            <X size={20} />
            Make My Own Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;
