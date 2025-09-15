import React from 'react';
import styled from 'styled-components';
import { Users, DollarSign, Clock, Target } from 'lucide-react';

const InfoContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.div`
  color: #d4c4a8;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: #f4e4bc;
  font-size: 16px;
  font-weight: 600;
`;

const RoundInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
`;

const RoundIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
`;

const RoundValue = styled.div`
  color: #f4e4bc;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const GameInfo = ({ game, players }) => {
  const activePlayers = players.filter(p => p.isActive && !p.isFolded).length;
  const totalChips = players.reduce((sum, player) => sum + player.chips, 0);
  const currentBet = game.currentBet;
  const pot = game.currentPot;

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
    <InfoContainer>
      <InfoCard>
        <InfoIcon>
          <Users size={20} color="white" />
        </InfoIcon>
        <InfoContent>
          <InfoLabel>Active Players</InfoLabel>
          <InfoValue>{activePlayers}/{players.length}</InfoValue>
        </InfoContent>
      </InfoCard>

      <InfoCard>
        <InfoIcon>
          <DollarSign size={20} color="white" />
        </InfoIcon>
        <InfoContent>
          <InfoLabel>Total Chips</InfoLabel>
          <InfoValue>${totalChips}</InfoValue>
        </InfoContent>
      </InfoCard>

      <InfoCard>
        <InfoIcon>
          <Target size={20} color="white" />
        </InfoIcon>
        <InfoContent>
          <InfoLabel>Current Bet</InfoLabel>
          <InfoValue>${currentBet}</InfoValue>
        </InfoContent>
      </InfoCard>

      <RoundInfo>
        <RoundIcon>
          <Clock size={20} color="white" />
        </RoundIcon>
        <RoundValue>{getRoundDisplay(game.currentRound)}</RoundValue>
      </RoundInfo>
    </InfoContainer>
  );
};

export default GameInfo;
