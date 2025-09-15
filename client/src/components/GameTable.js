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
  
  // 新增：自己玩家的状态管理
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [showMyHoleCards, setShowMyHoleCards] = useState(false);
  
  // 新增：设置玩家手牌的状态管理
  const [selectedPlayerForHoleCards, setSelectedPlayerForHoleCards] = useState(null);
  
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

  // 新增：设置自己玩家的函数
  const handleSetAsMe = (playerId) => {
    setMyPlayerId(playerId);
    setShowMyHoleCards(true);
  };

  // 新增：获取调整后的玩家位置（将自己显示在正下方）
  const getAdjustedPlayerPosition = (index, totalPlayers, myPlayerIndex) => {
    if (myPlayerIndex === -1) {
      // 如果没有设置自己，使用原始位置
      return getPlayerPosition(index, totalPlayers);
    }
    
    // 计算需要旋转的角度，使自己显示在正下方（180度位置，即正下方）
    const myOriginalAngle = (360 / totalPlayers) * myPlayerIndex;
    const rotationAngle = 180 - myOriginalAngle;
    
    const angle = (360 / totalPlayers) * index;
    const adjustedAngle = angle + rotationAngle;
    const radius = 320;
    const x = Math.cos((adjustedAngle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((adjustedAngle - 90) * Math.PI / 180) * radius;
    
    return {
      x: x + 400,
      y: y + 300,
      angle: adjustedAngle
    };
  };

  // 新增：获取自己的玩家信息
  const getMyPlayer = () => {
    if (!myPlayerId || !gameState?.players) return null;
    return gameState.players.find(p => p.id === myPlayerId);
  };

  // 新增：设置自己的手牌
  const handleSetMyHoleCards = async (holeCards) => {
    if (!myPlayerId) return;

    try {
      await setHoleCards(gameId, myPlayerId, holeCards);
      setShowHoleCardsSelector(false);
    } catch (err) {
      console.error('Failed to set my hole cards:', err);
    }
  };

  // 新增：设置玩家手牌的处理函数
  const handleSetPlayerHoleCards = (player) => {
    setSelectedPlayerForHoleCards(player);
    setShowHoleCardsSelector(true);
  };

  // 新增：确认设置玩家手牌
  const handleSetPlayerHoleCardsConfirm = async (holeCards) => {
    if (!selectedPlayerForHoleCards) return;

    try {
      await setHoleCards(gameId, selectedPlayerForHoleCards.id, holeCards);
      setShowHoleCardsSelector(false);
      setSelectedPlayerForHoleCards(null);
    } catch (err) {
      console.error('Failed to set player hole cards:', err);
    }
  };

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
    // 按照时钟方向排布：12点、3点、6点、9点方向
    let angle;
    
    if (totalPlayers === 2) {
      // 2个玩家：12点和6点方向
      angle = index === 0 ? 0 : 180;
    } else if (totalPlayers === 3) {
      // 3个玩家：12点、4点、8点方向
      angle = index === 0 ? 0 : (index === 1 ? 120 : 240);
    } else if (totalPlayers === 4) {
      // 4个玩家：12点、3点、6点、9点方向
      angle = index * 90;
    } else if (totalPlayers === 5) {
      // 5个玩家：12点、2.4点、4.8点、7.2点、9.6点方向
      angle = index * 72;
    } else if (totalPlayers === 6) {
      // 6个玩家：12点、2点、4点、6点、8点、10点方向
      angle = index * 60;
    } else if (totalPlayers === 7) {
      // 7个玩家：均匀分布
      angle = index * (360 / 7);
    } else if (totalPlayers === 8) {
      // 8个玩家：12点、1.5点、3点、4.5点、6点、7.5点、9点、10.5点方向
      angle = index * 45;
    } else {
      // 更多玩家：均匀分布
      angle = (360 / totalPlayers) * index;
    }
    
    const radius = 320; // 增加半径以适应更大的桌子
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
    
    return {
      x: x + 400, // 调整中心偏移量 (800/2 = 400)
      y: y + 300, // 调整中心偏移量 (600/2 = 300)
      angle: angle
    };
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const { game, players = [] } = gameState;
  const myPlayer = getMyPlayer();
  const myPlayerIndex = myPlayer ? players.findIndex(p => p.id === myPlayerId) : -1;

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
            const position = getAdjustedPlayerPosition(index, players.length, myPlayerIndex);
            const isMe = player.id === myPlayerId;
            return (
              <PlayerSeat
                key={player.id}
                player={player}
                position={position}
                isCurrentPlayer={player.id === gameState?.game?.currentPlayerId}
                isMe={isMe}
                myPlayerId={myPlayerId}
                onAction={handlePlayerAction}
                onGetAIRecommendation={handleGetAIRecommendation}
                onSetAsMe={handleSetAsMe}
                onSetPlayerHoleCards={handleSetPlayerHoleCards}
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

      {/* 新增：自己的手牌显示区域 */}
      {showMyHoleCards && myPlayer && (
        <div className="my-hole-cards-container">
          <div className="my-hole-cards-header">
            <h3>我的手牌 - {myPlayer.name}</h3>
            <button 
              className="set-hole-cards-btn"
              onClick={() => setShowHoleCardsSelector(true)}
              disabled={loading}
            >
              设置手牌
            </button>
          </div>
          <div className="my-hole-cards-display">
            {myPlayer.holeCards && myPlayer.holeCards.length > 0 ? (
              myPlayer.holeCards.map((card, index) => (
                <div key={index} className="my-hole-card">
                  <div className="card-value">{card.value}</div>
                  <div className={`card-suit ${card.suit}`}>
                    {card.suit === 'hearts' ? '♥' : 
                     card.suit === 'diamonds' ? '♦' : 
                     card.suit === 'clubs' ? '♣' : 
                     card.suit === 'spades' ? '♠' : card.suit}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-cards">暂无手牌</div>
            )}
          </div>
        </div>
      )}

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

      {showHoleCardsSelector && (
        <HoleCardsSelector
          player={selectedPlayerForHoleCards || (myPlayerId ? myPlayer : currentPlayer)}
          onConfirm={selectedPlayerForHoleCards ? handleSetPlayerHoleCardsConfirm : (myPlayerId ? handleSetMyHoleCards : handleHoleCardsConfirm)}
          onCancel={() => {
            setShowHoleCardsSelector(false);
            setSelectedPlayerForHoleCards(null);
          }}
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
