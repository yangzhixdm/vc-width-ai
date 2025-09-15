import React, { useState, useEffect, useRef } from 'react';
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
import './GameTable.css';

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
  // useEffect(() => {
  //   if (gameId) {
  //     getGameStateRef.current(gameId);
  //     const interval = setInterval(() => {
  //       getGameStateRef.current(gameId);
  //     }, 2000);
  //     return () => clearInterval(interval);
  //   }
  // }, [gameId]); // 只依赖 gameId，避免无限循环

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
        gameState?.game?.currentRound
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
      await getAIRecommendation(gameId, currentPlayer.id, gameState?.game?.currentRound);
      setShowAIRecommendation(true);
    } catch (err) {
      console.error('Failed to get AI recommendation:', err);
    }
  };

  const handleDealNextCards = async () => {
    if (!gameState) return;

    const rounds = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = rounds.indexOf(gameState?.game?.currentRound);
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
    const currentIndex = rounds.indexOf(gameState?.game?.currentRound);
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
    if (gameState.players) {
      gameState.players.forEach(player => {
        if (player.holeCards) {
          usedCards.push(...player.holeCards);
        }
      });
    }
    
    // 收集公共牌
    if (gameState.game && gameState.game.communityCards) {
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

  const { game, players = [] } = gameState;

  return (
    <div className="game-table-container">
      <GameInfo game={game} players={players} />
      
      <div className="game-table">
        <div className="game-table-table-controls">
          <button 
            className="game-table-control-button add-player"
            onClick={() => setShowAddPlayerDialog(true)}
            disabled={loading || players.length >= 8}
            title="Add Player"
          >
            +
          </button>
          <button 
            className="game-table-control-button settings"
            onClick={() => setShowBlindSettingsDialog(true)}
            disabled={loading}
            title="Blind Settings"
          >
            ⚙
          </button>
        </div>

        <div className="game-table-player-positions">
          {players.map((player, index) => {
            const position = getPlayerPosition(index, players.length);
            return (
              <PlayerSeat
                key={player.id}
                player={player}
                position={position}
                isCurrentPlayer={player.id === gameState?.game?.currentPlayerId}
                onAction={handlePlayerAction}
                onGetAIRecommendation={handleGetAIRecommendation}
              />
            );
          })}
        </div>

        <div className="game-table-center-area">
          <CommunityCards cards={game?.communityCards || []} />
          <div className="game-table-pot-display">${game?.currentPot || 0}</div>
          <div className="game-table-round-display">{game?.currentRound || 'preflop'}</div>
        </div>
      </div>

      <div className="game-table-controls">
        {gameState?.game?.status === 'waiting' && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={handleStartGame}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
          >
            {loading ? 'Starting...' : 'Start Game'}
          </button>
        )}

        {gameState?.game?.status === 'active' && currentPlayer?.isHuman && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={() => setShowBettingInterface(true)}
            disabled={!currentPlayer || loading}
          >
            Make Move
          </button>
        )}
        
        {gameState?.game?.status === 'active' && currentPlayer?.isHuman && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={handleGetAIRecommendation}
            disabled={!currentPlayer || loading}
          >
            Get AI Advice
          </button>
        )}
        
        {gameState?.game?.status === 'active' && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={handleDealNextCards}
            disabled={loading}
          >
            Deal Next Cards
          </button>
        )}
        
        {gameState?.game?.status === 'active' && currentPlayer && gameState?.game.currentRound === 'preflop' && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={() => setShowHoleCardsSelector(true)}
            disabled={loading}
          >
            Set Hole Cards
          </button>
        )}
        
        {gameState?.game?.status === 'active' && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={() => setShowSettleDialog(true)}
            disabled={loading || (game?.currentPot || 0) === 0}
          >
            Settle Chips
          </button>
        )}
        
        {gameState?.game?.status === 'active' && (
          <button 
            className="game-table-control-btn btn-secondary"
            onClick={handleEndHand}
            disabled={loading}
          >
            End Hand
          </button>
        )}
        
        <button 
          className="game-table-control-btn btn-secondary"
          onClick={onGameEnd}
        >
          End Game
        </button>
      </div>

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
          round={gameState?.game?.currentRound}
          existingCards={gameState?.game?.communityCards || []}
          onConfirm={handleCommunityCardsConfirm}
          onCancel={() => setShowCommunityCardsSelector(false)}
          usedCards={getAllUsedCards()}
        />
      )}

      {showSettleDialog && gameState && (
        <SettleChipsDialog
          players={(gameState?.players || []).filter(p => p.isActive && p.chips > 0)}
          potAmount={gameState?.game?.currentPot || 0}
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
          currentSmallBlind={gameState?.game?.smallBlind || 10}
          currentBigBlind={gameState?.game?.bigBlind || 20}
          onSave={handleSaveBlindSettings}
          onCancel={() => setShowBlindSettingsDialog(false)}
          loading={loading}
        />
      )}

      {error && (
        <div className="game-table-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default GameTable;
