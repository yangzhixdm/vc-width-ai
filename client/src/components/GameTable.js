import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useGame } from '../hooks/useGame';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import BettingInterface from './BettingInterface';
import AIRecommendation from './AIRecommendation';
import GameInfo from './GameInfo';
import HoleCardsSelector from './HoleCardsSelector';
import CommunityCardsSelector from './CommunityCardsSelector';
import SettleChipsDialog from './SettleChipsDialog';
import AddPlayerDialog from './AddPlayerDialog';
import BlindSettingsDialog from './BlindSettingsDialog';

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  width: 100%;
`;

const Table = styled.div`
  position: relative;
  width: 600px;
  height: 400px;
  background: radial-gradient(circle, #0d4a3a 0%, #0a3d2e 100%);
  border-radius: 50%;
  border: 8px solid #8b4513;
  box-shadow: 
    inset 0 0 50px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
`;

const CenterArea = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const PotDisplay = styled.div`
  background: rgba(255, 215, 0, 0.9);
  color: #000;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  min-width: 120px;
`;

const RoundDisplay = styled.div`
  color: #f4e4bc;
  font-size: 18px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PlayerPositions = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const GameControls = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const TableControls = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 15px;
  z-index: 10;
`;

const TableControlButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  &.add-player {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
  }

  &.settings {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
  }

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ControlButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  }

  &.btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const GameTable = ({ gameId, onGameEnd }) => {
  const { 
    gameState, 
    getGameState, 
    makeAction, 
    getAIRecommendation,
    setHoleCards,
    setCommunityCards,
    settleChips,
    endHand,
    startGame,
    addPlayer,
    loading, 
    error 
  } = useGame();

  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showBettingInterface, setShowBettingInterface] = useState(false);
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const [showHoleCardsSelector, setShowHoleCardsSelector] = useState(false);
  const [showCommunityCardsSelector, setShowCommunityCardsSelector] = useState(false);
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showBlindSettingsDialog, setShowBlindSettingsDialog] = useState(false);
  
  // 使用 ref 来存储最新的 getGameState 函数引用
  const getGameStateRef = useRef(getGameState);
  getGameStateRef.current = getGameState;

  // Load game state on mount and periodically
  useEffect(() => {
    if (gameId) {
      getGameStateRef.current(gameId);
      const interval = setInterval(() => {
        getGameStateRef.current(gameId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameId]); // 只依赖 gameId，避免无限循环

  // Find current player to act
  useEffect(() => {
    if (gameState?.players && gameState?.game?.currentPlayerId) {
      const currentPlayerToAct = gameState.players.find(p => p.id === gameState.game.currentPlayerId);
      setCurrentPlayer(currentPlayerToAct);
    } else if (gameState?.players) {
      // Fallback to human player if no current player set
      const humanPlayer = gameState.players.find(p => p.isHuman);
      setCurrentPlayer(humanPlayer);
    }
  }, [gameState]);

  const handlePlayerAction = async (actionType, amount = 0) => {
    if (!currentPlayer || !gameState) return;

    try {
      const result = await makeAction(
        gameId, 
        currentPlayer.id, 
        actionType, 
        amount, 
        gameState.game.currentRound
      );
      
      setShowBettingInterface(false);
      setShowAIRecommendation(false);
      
      // Show notification about next player if available
      if (result.nextPlayer) {
        console.log(`Next player: ${result.nextPlayer.name}`);
      }
    } catch (err) {
      console.error('Failed to make action:', err);
    }
  };

  const handleGetAIRecommendation = async () => {
    if (!currentPlayer || !gameState) return;

    try {
      await getAIRecommendation(gameId, currentPlayer.id, gameState.game.currentRound);
      setShowAIRecommendation(true);
    } catch (err) {
      console.error('Failed to get AI recommendation:', err);
    }
  };

  const handleDealNextCards = async () => {
    if (!gameState) return;

    const rounds = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = rounds.indexOf(gameState.game.currentRound);
    const nextRound = rounds[currentIndex + 1];

    if (nextRound) {
      setShowCommunityCardsSelector(true);
    }
  };

  const handleHoleCardsConfirm = async (holeCards) => {
    if (!currentPlayer) return;

    try {
      await setHoleCards(gameId, currentPlayer.id, holeCards);
      setShowHoleCardsSelector(false);
    } catch (err) {
      console.error('Failed to set hole cards:', err);
    }
  };

  const handleCommunityCardsConfirm = async (communityCards) => {
    if (!gameState) return;

    const rounds = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = rounds.indexOf(gameState.game.currentRound);
    const nextRound = rounds[currentIndex + 1];

    if (nextRound) {
      try {
        await setCommunityCards(gameId, communityCards, nextRound);
        setShowCommunityCardsSelector(false);
      } catch (err) {
        console.error('Failed to set community cards:', err);
      }
    }
  };

  const handleSettleChips = async (winnerId) => {
    try {
      const result = await settleChips(gameId, winnerId);
      console.log(`Winner: ${result.winner.name}, Chips won: ${result.winner.chipsWon}`);
      setShowSettleDialog(false);
    } catch (err) {
      console.error('Failed to settle chips:', err);
    }
  };

  const handleEndHand = async () => {
    try {
      const result = await endHand(gameId);
      if (result.gameEnded) {
        console.log('Game ended:', result.reason);
      } else {
        console.log(`Next hand started with ${result.activePlayers} players`);
      }
    } catch (err) {
      console.error('Failed to end hand:', err);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame(gameId);
      console.log('Game started successfully');
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  const handleAddPlayer = async (playerData) => {
    try {
      await addPlayer(gameId, playerData);
      setShowAddPlayerDialog(false);
      console.log('Player added successfully');
    } catch (err) {
      console.error('Failed to add player:', err);
    }
  };

  const handleSaveBlindSettings = async ({ smallBlind, bigBlind }) => {
    try {
      // Note: This would require a new API endpoint to update blind settings
      // For now, we'll just close the dialog
      setShowBlindSettingsDialog(false);
      console.log('Blind settings updated:', { smallBlind, bigBlind });
    } catch (err) {
      console.error('Failed to update blind settings:', err);
    }
  };

  const getAllUsedCards = () => {
    if (!gameState) return [];
    
    const usedCards = [];
    
    // 收集所有玩家的手牌
    gameState.players.forEach(player => {
      if (player.holeCards) {
        usedCards.push(...player.holeCards);
      }
    });
    
    // 收集公共牌
    if (gameState.game.communityCards) {
      usedCards.push(...gameState.game.communityCards);
    }
    
    return usedCards;
  };

  const getPlayerPosition = (index, totalPlayers) => {
    const angle = (360 / totalPlayers) * index;
    const radius = 250;
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
    
    return {
      x: x + 300, // Center offset
      y: y + 200, // Center offset
      angle: angle
    };
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const { game, players } = gameState;

  return (
    <TableContainer>
      <GameInfo game={game} players={players} />
      
      <Table>
        <TableControls>
          <TableControlButton 
            className="add-player"
            onClick={() => setShowAddPlayerDialog(true)}
            disabled={loading || players.length >= 8}
            title="Add Player"
          >
            +
          </TableControlButton>
          <TableControlButton 
            className="settings"
            onClick={() => setShowBlindSettingsDialog(true)}
            disabled={loading}
            title="Blind Settings"
          >
            ⚙
          </TableControlButton>
        </TableControls>

        <PlayerPositions>
          {players.map((player, index) => {
            const position = getPlayerPosition(index, players.length);
            return (
              <PlayerSeat
                key={player.id}
                player={player}
                position={position}
                isCurrentPlayer={player.id === gameState.game.currentPlayerId}
                onAction={handlePlayerAction}
                onGetAIRecommendation={handleGetAIRecommendation}
              />
            );
          })}
        </PlayerPositions>

        <CenterArea>
          <CommunityCards cards={game.communityCards} />
          <PotDisplay>${game.currentPot}</PotDisplay>
          <RoundDisplay>{game.currentRound}</RoundDisplay>
        </CenterArea>
      </Table>

      <GameControls>
        {gameState?.game?.status === 'waiting' && (
          <ControlButton 
            className="btn-secondary"
            onClick={handleStartGame}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
          >
            {loading ? 'Starting...' : 'Start Game'}
          </ControlButton>
        )}

        {gameState?.game?.status === 'active' && currentPlayer?.isHuman && (
          <ControlButton 
            className="btn-secondary"
            onClick={() => setShowBettingInterface(true)}
            disabled={!currentPlayer || loading}
          >
            Make Move
          </ControlButton>
        )}
        
        {gameState?.game?.status === 'active' && currentPlayer?.isHuman && (
          <ControlButton 
            className="btn-secondary"
            onClick={handleGetAIRecommendation}
            disabled={!currentPlayer || loading}
          >
            Get AI Advice
          </ControlButton>
        )}
        
        {gameState?.game?.status === 'active' && (
          <ControlButton 
            className="btn-secondary"
            onClick={handleDealNextCards}
            disabled={loading}
          >
            Deal Next Cards
          </ControlButton>
        )}
        
        {gameState?.game?.status === 'active' && currentPlayer && gameState?.game.currentRound === 'preflop' && (
          <ControlButton 
            className="btn-secondary"
            onClick={() => setShowHoleCardsSelector(true)}
            disabled={loading}
          >
            Set Hole Cards
          </ControlButton>
        )}
        
        {gameState?.game?.status === 'active' && (
          <ControlButton 
            className="btn-secondary"
            onClick={() => setShowSettleDialog(true)}
            disabled={loading || game.currentPot === 0}
          >
            Settle Chips
          </ControlButton>
        )}
        
        {gameState?.game?.status === 'active' && (
          <ControlButton 
            className="btn-secondary"
            onClick={handleEndHand}
            disabled={loading}
          >
            End Hand
          </ControlButton>
        )}
        
        <ControlButton 
          className="btn-secondary"
          onClick={onGameEnd}
        >
          End Game
        </ControlButton>
      </GameControls>

      {showBettingInterface && (
        <BettingInterface
          game={game}
          player={currentPlayer}
          onAction={handlePlayerAction}
          onClose={() => setShowBettingInterface(false)}
        />
      )}

      {showAIRecommendation && (
        <AIRecommendation
          onAccept={(action, amount) => {
            handlePlayerAction(action, amount);
            setShowAIRecommendation(false);
          }}
          onReject={() => setShowAIRecommendation(false)}
        />
      )}

      {showHoleCardsSelector && currentPlayer && (
        <HoleCardsSelector
          player={currentPlayer}
          onConfirm={handleHoleCardsConfirm}
          onCancel={() => setShowHoleCardsSelector(false)}
          usedCards={getAllUsedCards()}
        />
      )}

      {showCommunityCardsSelector && gameState && (
        <CommunityCardsSelector
          round={gameState.game.currentRound}
          existingCards={gameState.game.communityCards || []}
          onConfirm={handleCommunityCardsConfirm}
          onCancel={() => setShowCommunityCardsSelector(false)}
          usedCards={getAllUsedCards()}
        />
      )}

      {showSettleDialog && gameState && (
        <SettleChipsDialog
          players={gameState.players.filter(p => p.isActive && p.chips > 0)}
          potAmount={gameState.game.currentPot}
          onSettle={handleSettleChips}
          onCancel={() => setShowSettleDialog(false)}
          loading={loading}
        />
      )}

      {showAddPlayerDialog && (
        <AddPlayerDialog
          onAddPlayer={handleAddPlayer}
          onCancel={() => setShowAddPlayerDialog(false)}
          loading={loading}
          maxPlayers={8}
          currentPlayerCount={gameState?.players?.length || 0}
        />
      )}

      {showBlindSettingsDialog && gameState && (
        <BlindSettingsDialog
          currentSmallBlind={gameState.game.smallBlind}
          currentBigBlind={gameState.game.bigBlind}
          onSave={handleSaveBlindSettings}
          onCancel={() => setShowBlindSettingsDialog(false)}
          loading={loading}
        />
      )}

      {error && (
        <div style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '20px' }}>
          {error}
        </div>
      )}
    </TableContainer>
  );
};

export default GameTable;
