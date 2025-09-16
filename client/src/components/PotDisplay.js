import React from 'react';
import './PotDisplay.css';

const PotDisplay = ({ potAmount, currentRound }) => {
  // 根据底池金额计算需要显示的筹码数量和类型
  const getChipStacks = (amount) => {
    const stacks = [];
    let remaining = amount;
    
    // 定义筹码面值（从大到小）
    const chipValues = [1000, 500, 100, 50, 25, 10, 5, 1];
    
    chipValues.forEach(value => {
      if (remaining >= value) {
        const count = Math.floor(remaining / value);
        const maxChips = Math.min(count, 8); // 最多显示8个筹码
        if (maxChips > 0) {
          stacks.push({
            value: value,
            count: maxChips,
            total: maxChips * value
          });
          remaining -= maxChips * value;
        }
      }
    });
    
    return stacks;
  };

  const chipStacks = getChipStacks(potAmount);

  return (
    <div className="pot-display-container">
      <div className="pot-display-background">
        {/* 底池筹码堆叠 */}
        <div className="pot-chips-container">
          {chipStacks.map((stack, stackIndex) => (
            <div key={stackIndex} className="pot-chip-stack">
              {Array.from({ length: Math.min(stack.count, 6) }, (_, chipIndex) => (
                <div
                  key={chipIndex}
                  className={`pot-chip pot-chip-${stack.value}`}
                  style={{
                    transform: `translate(${chipIndex * 2}px, ${chipIndex * -3}px) rotate(${chipIndex * 5}deg)`,
                    zIndex: chipIndex
                  }}
                >
                  <div className="pot-chip-value">${stack.value}</div>
                </div>
              ))}
              {stack.count > 6 && (
                <div className="pot-chip-count">+{stack.count - 6}</div>
              )}
            </div>
          ))}
        </div>
        
        {/* 底池金额显示 */}
        <div className="pot-amount-display">
          <div className="pot-amount">{potAmount}</div>
          <div className="pot-label"></div>
        </div>
      </div>
      
      {/* 游戏阶段显示 */}
      <div className="game-table-round-display">{currentRound || 'preflop'}</div>
    </div>
  );
};

export default PotDisplay;
