import React, { useEffect, useState } from 'react';
import './ChipAnimation.css';

const ChipAnimation = ({ 
  fromPosition, 
  toPosition, 
  amount, 
  onComplete,
  isVisible = false 
}) => {
  const [animationState, setAnimationState] = useState('idle');

  useEffect(() => {
    if (isVisible && fromPosition && toPosition) {
      setAnimationState('animating');
      
      // 动画持续时间
      const animationDuration = 1000; // 1秒
      
      // 动画完成后调用回调
      const timer = setTimeout(() => {
        setAnimationState('completed');
        if (onComplete) {
          onComplete();
        }
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, fromPosition, toPosition, onComplete]);

  if (!isVisible || !fromPosition || !toPosition) {
    return null;
  }

  // 计算动画路径
  const startX = fromPosition.x;
  const startY = fromPosition.y;
  const endX = toPosition.x;
  const endY = toPosition.y;
  
  // 创建弧形路径的控制点
  const controlX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - 100; // 向上弯曲

  // 根据金额确定筹码颜色
  const getChipClass = (amount) => {
    if (amount >= 1000) return 'xlarge';
    if (amount >= 500) return 'large';
    if (amount >= 100) return 'medium';
    return 'small';
  };

  return (
    <div className="chip-animation-container">
      <div 
        className={`chip-animation ${animationState}`}
        style={{
          '--start-x': `${startX}px`,
          '--start-y': `${startY}px`,
          '--end-x': `${endX}px`,
          '--end-y': `${endY}px`,
          '--control-x': `${controlX}px`,
          '--control-y': `${controlY}px`,
        }}
      >
        <div className={`chip ${getChipClass(amount)}`}>
          <div className="chip-value">${amount}</div>
        </div>
      </div>
    </div>
  );
};

export default ChipAnimation;
