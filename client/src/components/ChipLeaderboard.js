import React from 'react';
import './ChipLeaderboard.css';

const ChipLeaderboard = ({ players = [], onBuyIn }) => {
  // 计算每个玩家的盈亏情况并排序
  const playersWithProfit = players
    .filter(player => player.isActive) // 只显示活跃玩家
    .map(player => {
      const profit = player.chips - player.totalBuyIn;
      return {
        ...player,
        profit: profit
      };
    })
    .sort((a, b) => b.chips - a.chips); // 按当前筹码数量排序

  const handleBuyIn = (playerId) => {
    if (onBuyIn) {
      onBuyIn(playerId);
    }
  };

  return (
    <div className="chip-leaderboard">
      <div className="leaderboard-header">
        <h3>筹码排行榜</h3>
      </div>
      <div className="leaderboard-content">
        {playersWithProfit.length === 0 ? (
          <div className="no-players">暂无玩家</div>
        ) : (
          playersWithProfit.map((player, index) => (
            <div key={player.id} className="leaderboard-item">
              <div className="player-rank">#{index + 1}</div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-chips">
                  <span className="chips-amount">{player.chips.toLocaleString()}</span>
                  <span className="chips-label">筹码</span>
                </div>
                <div className="player-profit">
                  {player.profit >= 0 ? (
                    <span className="profit-positive">+{player.profit.toLocaleString()}</span>
                  ) : (
                    <span className="profit-negative">{player.profit.toLocaleString()}</span>
                  )}
                </div>
                <div className="player-buyin-info">
                  买入: {player.totalBuyIn.toLocaleString()}
                </div>
              </div>
              <div className="player-actions">
                {player.chips === 0 && (
                  <button 
                    className="buyin-btn"
                    onClick={() => handleBuyIn(player.id)}
                    title="买入2000筹码"
                  >
                    买入
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChipLeaderboard;
