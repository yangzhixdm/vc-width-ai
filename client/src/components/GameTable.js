import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ButtonPositionDialog from './ButtonPositionDialog';
import RaiseAmountDialog from './RaiseAmountDialog';
import GameFlowNotification from './GameFlowNotification';
import ChipAnimation from './ChipAnimation';
import PotDisplay from './PotDisplay';
import './GameTable.css';

const GameTable = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
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
    setButtonPosition,
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
  const [showButtonPositionDialog, setShowButtonPositionDialog] = useState(false);
  
  // 新增：自己玩家的状态管理
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [showMyHoleCards, setShowMyHoleCards] = useState(false);
  
  // 新增：设置玩家手牌的状态管理
  const [selectedPlayerForHoleCards, setSelectedPlayerForHoleCards] = useState(null);
  
  // 新增：加注弹层的状态管理
  const [showRaiseDialog, setShowRaiseDialog] = useState(false);
  const [selectedPlayerForRaise, setSelectedPlayerForRaise] = useState(null);
  
  // 新增：游戏流程通知的状态管理
  const [showGameFlowNotification, setShowGameFlowNotification] = useState(false);
  const [gameFlowMessage, setGameFlowMessage] = useState('');
  
  // 新增：筹码动画的状态管理
  const [chipAnimations, setChipAnimations] = useState([]);
  
  // 使用 ref 来存储最新的 getGameState 函数引用
  const getGameStateRef = useRef(getGameState);
  getGameStateRef.current = getGameState;

  // Load game state on mount and periodically
  useEffect(() => {
    if (gameId) {
      const loadGame = async () => {
        try {
          await getGameStateRef.current(gameId);
        } catch (err) {
          console.error('Failed to load game:', err);
          // If game doesn't exist or there's an error, redirect to home
          navigate('/');
        }
      };
      
      loadGame();
      // const interval = setInterval(() => {
      //   getGameStateRef.current(gameId);
      // }, 2000);
      // return () => clearInterval(interval);
    }
  }, [gameId, navigate]); // 只依赖 gameId，避免无限循环

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
          const radius = 380;
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

  // 新增：触发筹码动画（从玩家到底池）
  const triggerChipAnimation = (playerId, amount) => {
    if (!gameState?.players || amount <= 0) return;

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    // 找到玩家在数组中的索引
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    // 计算玩家位置
    const myPlayerIndex = myPlayerId ? gameState.players.findIndex(p => p.id === myPlayerId) : -1;
    const playerPosition = getAdjustedPlayerPosition(playerIndex, gameState.players.length, myPlayerIndex);

    // 底池位置（桌子中心）
    const potPosition = { x: 400, y: 300 }; // 桌子中心位置

    // 创建动画对象
    const animationId = Date.now() + Math.random();
    const newAnimation = {
      id: animationId,
      fromPosition: playerPosition,
      toPosition: potPosition,
      amount: amount,
      isVisible: true
    };

    // 添加到动画列表
    setChipAnimations(prev => [...prev, newAnimation]);

    // 动画完成后移除
    setTimeout(() => {
      setChipAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 1200); // 比动画时间长一点
  };

  // 新增：触发从底池到玩家的筹码动画
  const triggerPotToPlayerAnimation = (playerId, amount) => {
    if (!gameState?.players || amount <= 0) return;

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    // 找到玩家在数组中的索引
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    // 计算玩家位置
    const myPlayerIndex = myPlayerId ? gameState.players.findIndex(p => p.id === myPlayerId) : -1;
    const playerPosition = getAdjustedPlayerPosition(playerIndex, gameState.players.length, myPlayerIndex);

    // 底池位置（桌子中心）
    const potPosition = { x: 400, y: 300 }; // 桌子中心位置

    // 创建动画对象（从底池到玩家）
    const animationId = Date.now() + Math.random();
    const newAnimation = {
      id: animationId,
      fromPosition: potPosition,
      toPosition: playerPosition,
      amount: amount,
      isVisible: true,
      isPotToPlayer: true // 标记这是从底池到玩家的动画
    };

    // 添加到动画列表
    setChipAnimations(prev => [...prev, newAnimation]);

    // 动画完成后移除
    setTimeout(() => {
      setChipAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 1200); // 比动画时间长一点
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

  // 新增：处理玩家操作
  const handlePlayerAction = (player, actionType) => {
    if (actionType === 'raise') {
      setSelectedPlayerForRaise(player);
      setShowRaiseDialog(true);
    } else {
      // 计算跟注金额
      let actionAmount = 0;
      if (actionType === 'call') {
        const game = gameState?.game;
        if (game) {
          actionAmount = Math.max(0, game.currentBet - player.currentBet);
        }
      }
      
      // 直接执行其他操作
      handlePlayerActionDirect(player, actionType, actionAmount);
    }
  };

  // 新增：直接执行玩家操作
  const handlePlayerActionDirect = async (player, actionType, amount = 0) => {
    try {
      // 记录操作前的底池金额
      const result = await makeAction(
        gameId, 
        player.id, 
        actionType, 
        amount, 
        gameState?.game?.currentRound
      );
      
      // 检查是否有筹码投入底池，如果有则触发动画
      if (amount > 0 && (actionType === 'call' || actionType === 'raise' || actionType === 'allin')) {
        // 延迟一点触发动画，让游戏状态先更新
        setTimeout(() => {
          triggerChipAnimation(player.id, amount);
        }, 100);
      }
      
      // Handle game flow notifications
      if (result.roundComplete && result.nextRound) {
        let message = '';
        switch (result.nextRound) {
          case 'flop':
            message = '翻牌阶段开始！发3张公共牌';
            break;
          case 'turn':
            message = '转牌阶段开始！发第4张公共牌';
            break;
          case 'river':
            message = '河牌阶段开始！发第5张公共牌';
            break;
          case 'showdown':
            message = '摊牌阶段！比较手牌确定获胜者';
            // 处理自动showdown的筹码动画
            if (result.showdownResult && result.showdownResult.winner) {
              const winner = result.showdownResult.winner;
              const potAmount = result.showdownResult.pot || 0;
              if (potAmount > 0) {
                // 延迟一点触发动画，让游戏状态先更新
                setTimeout(() => {
                  triggerPotToPlayerAnimation(winner.player.playerId, potAmount);
                }, 500);
              }
            }
            break;
          default:
            message = `进入${result.nextRound}阶段`;
        }
        
        setGameFlowMessage(message);
        // setShowGameFlowNotification(true);
      }
    } catch (err) {
      console.error('Failed to make player action:', err);
    }
  };

  // 新增：确认加注
  const handleRaiseConfirm = async (amount) => {
    if (!selectedPlayerForRaise) return;

    try {
      await handlePlayerActionDirect(selectedPlayerForRaise, 'raise', amount);
      setShowRaiseDialog(false);
      setSelectedPlayerForRaise(null);
    } catch (err) {
      console.error('Failed to raise:', err);
    }
  };

  const handleCurrentPlayerAction = async (actionType, amount = 0) => {
    if (!currentPlayer || !gameState) return;

    try {
      // 检查是否有筹码投入底池，如果有则触发动画
      if (amount > 0 && (actionType === 'call' || actionType === 'raise' || actionType === 'allin')) {
        // 延迟一点触发动画，让游戏状态先更新
        setTimeout(() => {
          triggerChipAnimation(currentPlayer.id, amount);
        }, 100);
      }
      
      const result = await makeAction(
        gameId, 
        currentPlayer.id, 
        actionType, 
        amount, 
        gameState?.game?.currentRound
      );
      
      setShowBettingInterface(false);
      setShowAIRecommendation(false);
      
      // Handle game flow notifications
      console.log('GameTable - Action result:', result);
      if (result.roundComplete && result.nextRound) {
        console.log('Round completed! Next round:', result.nextRound);
        let message = '';
        
        // Check if game continued to next hand
        if (result.gameContinued && result.handNumber) {
          message = `第${result.handNumber}手开始！新的一轮游戏`;
        } else {
          switch (result.nextRound) {
            case 'flop':
              message = '翻牌阶段开始！发3张公共牌';
              break;
            case 'turn':
              message = '转牌阶段开始！发第4张公共牌';
              break;
            case 'river':
              message = '河牌阶段开始！发第5张公共牌';
              break;
            case 'showdown':
              message = '摊牌阶段！比较手牌确定获胜者';
              // 处理自动showdown的筹码动画
              if (result.showdownResult && result.showdownResult.winner) {
                const winner = result.showdownResult.winner;
                const potAmount = result.showdownResult.pot || 0;
                if (potAmount > 0) {
                  // 延迟一点触发动画，让游戏状态先更新
                  setTimeout(() => {
                    triggerPotToPlayerAnimation(winner.player.playerId, potAmount);
                  }, 500);
                }
              }
              break;
            default:
              message = `进入${result.nextRound}阶段`;
          }
        }
        
        setGameFlowMessage(message);
        setShowGameFlowNotification(true);
      } else {
        console.log('Round not complete yet. roundComplete:', result.roundComplete, 'nextRound:', result.nextRound);
      }
      
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
      
      // 触发从底池到玩家的筹码动画
      if (result.winner && result.winner.chipsWon > 0) {
        triggerPotToPlayerAnimation(winnerId, result.winner.chipsWon);
      }
      
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

  const handleSetButtonPosition = async (buttonPlayerId) => {
    try {
      await setButtonPosition(gameId, buttonPlayerId);
      console.log('Button position updated successfully');
    } catch (error) {
      console.error('Error setting button position:', error);
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
    
          const radius = 380; // 增加半径让头像放在桌子外面
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

  // Show loading state if game is being loaded
  if (loading && !gameState) {
    return (
      <div className="game-table-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-table-container">
      <GameInfo 
        game={game} 
        players={players} 
        onAddPlayer={() => setShowAddPlayerDialog(true)}
        onBlindSettings={() => setShowBlindSettingsDialog(true)}
        onButtonPosition={() => setShowButtonPositionDialog(true)}
        loading={loading}
      />
      
      
      <div className="game-table">
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
                onAction={handleCurrentPlayerAction}
                onGetAIRecommendation={handleGetAIRecommendation}
                onSetAsMe={handleSetAsMe}
                onSetPlayerHoleCards={handleSetPlayerHoleCards}
                onPlayerAction={handlePlayerAction}
                gameStatus={gameState?.game?.status}
              />
            );
          })}
        </div>

        <div className="game-table-center-area">
          <CommunityCards cards={game?.communityCards || []} />
          <PotDisplay 
            potAmount={game?.currentPot || 0} 
            currentRound={game?.currentRound || 'preflop'} 
          />
        </div>

        {/* 筹码动画 */}
        {chipAnimations.map((animation) => (
          <ChipAnimation
            key={animation.id}
            fromPosition={animation.fromPosition}
            toPosition={animation.toPosition}
            amount={animation.amount}
            isVisible={animation.isVisible}
            isPotToPlayer={animation.isPotToPlayer}
            onComplete={() => {
              // 动画完成后的回调
            }}
          />
        ))}
      </div>

      {/* 新增：自己的手牌显示区域 */}
      {showMyHoleCards && myPlayer && (
        <div className="my-hole-cards-container">
          <div className="my-hole-cards-header">
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
          onClick={() => navigate('/')}
        >
          End Game
        </button>
      </div>

      {showBettingInterface && (
        <BettingInterface
          game={game}
          player={currentPlayer}
          onAction={handleCurrentPlayerAction}
          onClose={() => setShowBettingInterface(false)}
        />
      )}

      {showAIRecommendation && (
        <AIRecommendation
          onAccept={(action, amount) => {
            handleCurrentPlayerAction(action, amount);
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

      {showButtonPositionDialog && gameState && (
        <ButtonPositionDialog
          players={gameState.players || []}
          onSetButtonPosition={handleSetButtonPosition}
          onClose={() => setShowButtonPositionDialog(false)}
          loading={loading}
        />
      )}

      {showRaiseDialog && selectedPlayerForRaise && (
        <RaiseAmountDialog
          player={selectedPlayerForRaise}
          currentBet={gameState?.game?.currentBet || 0}
          playerChips={selectedPlayerForRaise.chips}
          onConfirm={handleRaiseConfirm}
          onCancel={() => {
            setShowRaiseDialog(false);
            setSelectedPlayerForRaise(null);
          }}
        />
      )}

      {error && (
        <div className="game-table-error">
          {error}
        </div>
      )}

      {/* 游戏流程通知 */}
      <GameFlowNotification
        gameState={gameState}
        showNotification={showGameFlowNotification}
        notificationMessage={gameFlowMessage}
        onClose={() => setShowGameFlowNotification(false)}
      />
    </div>
  );
};

export default GameTable;
