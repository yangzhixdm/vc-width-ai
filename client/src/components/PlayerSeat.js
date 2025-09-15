import React from 'react';
import styled from 'styled-components';
import { User, Coins } from 'lucide-react';

const SeatContainer = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }

  &.current-player {
    transform: translate(-50%, -50%) scale(1.1);
    filter: drop-shadow(0 0 10px rgba(74, 158, 255, 0.8));
  }
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.avatar ? `url(${props.avatar})` : 'linear-gradient(135deg, #4a9eff 0%, #357abd 100%)'};
  background-size: cover;
  background-position: center;
  border: 3px solid ${props => props.isCurrentPlayer ? '#4a9eff' : '#2d7a5f'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  position: relative;

  &.folded {
    opacity: 0.5;
    filter: grayscale(100%);
  }

  &.all-in {
    border-color: #ff9800;
    box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
  }
`;

const PlayerInfo = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  min-width: 80px;
  backdrop-filter: blur(10px);
`;

const PlayerName = styled.div`
  color: #f4e4bc;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
`;

const PlayerChips = styled.div`
  color: #4a9eff;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const PlayerRole = styled.div`
  color: #ff9800;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
`;

const CurrentBet = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: -5px;
  left: -5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;

  &.folded {
    background: #f44336;
    color: white;
  }

  &.all-in {
    background: #ff9800;
    color: white;
  }

  &.dealer {
    background: #9c27b0;
    color: white;
  }
`;

const PlayerSeat = ({ 
  player, 
  position, 
  isCurrentPlayer, 
  onAction, 
  onGetAIRecommendation 
}) => {
  const getStatusClass = () => {
    if (player.isFolded) return 'folded';
    if (player.isAllIn) return 'all-in';
    return '';
  };

  const getStatusIndicator = () => {
    if (player.isFolded) return 'F';
    if (player.isAllIn) return 'A';
    if (player.role === 'button') return 'D';
    return null;
  };

  const getStatusClassIndicator = () => {
    if (player.isFolded) return 'folded';
    if (player.isAllIn) return 'all-in';
    if (player.role === 'button') return 'dealer';
    return '';
  };

  return (
    <SeatContainer
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      className={isCurrentPlayer ? 'current-player' : ''}
    >
      <Avatar 
        avatar={player.avatar}
        isCurrentPlayer={isCurrentPlayer}
        className={getStatusClass()}
      >
        {!player.avatar && <User size={24} color="white" />}
        {player.currentBet > 0 && (
          <CurrentBet>
            ${player.currentBet}
          </CurrentBet>
        )}
        {getStatusIndicator() && (
          <StatusIndicator className={getStatusClassIndicator()}>
            {getStatusIndicator()}
          </StatusIndicator>
        )}
      </Avatar>

      <PlayerInfo>
        <PlayerName>
          {player.name}
          {player.isHuman && ' (You)'}
        </PlayerName>
        <PlayerChips>
          <Coins size={12} />
          ${player.chips}
        </PlayerChips>
        <PlayerRole>{player.role}</PlayerRole>
      </PlayerInfo>
    </SeatContainer>
  );
};

export default PlayerSeat;
