import React from 'react';
import styled from 'styled-components';
import { useGame } from '../hooks/useGame';
import { Brain, Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const RecommendationCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const BrainIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
`;

const Title = styled.h2`
  color: #f4e4bc;
  margin: 0;
  font-size: 1.8rem;
`;

const RecommendationSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: center;
`;

const RecommendationAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;

  &.check {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }

  &.call {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }

  &.raise {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  }

  &.fold {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  }
`;

const ActionText = styled.div`
  color: #f4e4bc;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const AmountText = styled.div`
  color: #4a9eff;
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 10px;
`;

const ConfidenceBar = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 20px;
  margin: 15px 0;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, 
    ${props => props.confidence < 50 ? '#f44336' : 
      props.confidence < 75 ? '#ff9800' : '#4caf50'} 0%, 
    ${props => props.confidence < 50 ? '#d32f2f' : 
      props.confidence < 75 ? '#f57c00' : '#388e3c'} 100%
  );
  width: ${props => props.confidence}%;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const Reasoning = styled.div`
  color: #d4c4a8;
  font-size: 1rem;
  line-height: 1.5;
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #4a9eff;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.btn-accept {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }

  &.btn-reject {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

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
    <Overlay>
      <RecommendationCard>
        <Header>
          <BrainIcon>
            <Brain size={24} color="white" />
          </BrainIcon>
          <Title>AI Recommendation</Title>
        </Header>

        <RecommendationSection>
          <RecommendationAction>
            <ActionIcon className={aiRecommendation.action}>
              {getActionIcon(aiRecommendation.action)}
            </ActionIcon>
            <ActionText>{aiRecommendation.action}</ActionText>
          </RecommendationAction>

          {aiRecommendation.amount > 0 && (
            <AmountText>${aiRecommendation.amount}</AmountText>
          )}

          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              color: '#d4c4a8', 
              fontSize: '14px', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <TrendingUp size={16} />
              Confidence Level
            </div>
            <ConfidenceBar>
              <ConfidenceFill confidence={aiRecommendation.confidence}>
                {aiRecommendation.confidence}%
              </ConfidenceFill>
            </ConfidenceBar>
          </div>

          {aiRecommendation.reasoning && (
            <Reasoning>
              <strong>AI Analysis:</strong><br />
              {aiRecommendation.reasoning}
            </Reasoning>
          )}
        </RecommendationSection>

        <ActionButtons>
          <ActionButton 
            className="btn-accept"
            onClick={handleAccept}
          >
            <Check size={20} />
            Accept Recommendation
          </ActionButton>
          
          <ActionButton 
            className="btn-reject"
            onClick={onReject}
          >
            <X size={20} />
            Make My Own Move
          </ActionButton>
        </ActionButtons>
      </RecommendationCard>
    </Overlay>
  );
};

export default AIRecommendation;
