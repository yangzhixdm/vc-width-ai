import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';
import './RaiseAmountDialog.css';

const RaiseAmountDialog = ({ 
  player, 
  currentBet, 
  playerChips, 
  onConfirm, 
  onCancel 
}) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('请输入有效的金额');
      return;
    }
    
    if (numAmount < currentBet) {
      setError(`加注金额不能少于当前下注 $${currentBet}`);
      return;
    }
    
    if (numAmount > playerChips) {
      setError(`加注金额不能超过玩家筹码 $${playerChips}`);
      return;
    }
    
    onConfirm(numAmount);
  };

  const handleQuickAmount = (multiplier) => {
    const quickAmount = currentBet * multiplier;
    if (quickAmount <= playerChips) {
      setAmount(quickAmount.toString());
      setError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="raise-amount-dialog-overlay" onClick={onCancel}>
      <div className="raise-amount-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="raise-amount-dialog-header">
          <div className="raise-amount-dialog-icon">
            <DollarSign size={24} color="white" />
          </div>
          <h2 className="raise-amount-dialog-title">加注金额</h2>
          <button className="raise-amount-dialog-close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="raise-amount-dialog-player-info">
          <div className="raise-amount-dialog-player-name">
            {player.name}
          </div>
          <div className="raise-amount-dialog-player-chips">
            筹码: ${playerChips}
          </div>
          <div className="raise-amount-dialog-current-bet">
            当前下注: ${currentBet}
          </div>
        </div>

        <div className="raise-amount-dialog-input-section">
          <label className="raise-amount-dialog-label">
            加注金额 ($)
          </label>
          <input
            type="number"
            className="raise-amount-dialog-input"
            value={amount}
            onChange={handleAmountChange}
            onKeyPress={handleKeyPress}
            placeholder={`最小: $${currentBet}`}
            min={currentBet}
            max={playerChips}
            step="1"
            autoFocus
          />
          {error && (
            <div className="raise-amount-dialog-error">
              {error}
            </div>
          )}
        </div>

        <div className="raise-amount-dialog-quick-amounts">
          <div className="raise-amount-dialog-quick-title">快速选择:</div>
          <div className="raise-amount-dialog-quick-buttons">
            <button 
              className="raise-amount-dialog-quick-btn"
              onClick={() => handleQuickAmount(2)}
              disabled={currentBet * 2 > playerChips}
            >
              2x (${currentBet * 2})
            </button>
            <button 
              className="raise-amount-dialog-quick-btn"
              onClick={() => handleQuickAmount(3)}
              disabled={currentBet * 3 > playerChips}
            >
              3x (${currentBet * 3})
            </button>
            <button 
              className="raise-amount-dialog-quick-btn"
              onClick={() => handleQuickAmount(5)}
              disabled={currentBet * 5 > playerChips}
            >
              5x (${currentBet * 5})
            </button>
            <button 
              className="raise-amount-dialog-quick-btn all-in"
              onClick={() => setAmount(playerChips.toString())}
            >
              全下 (${playerChips})
            </button>
          </div>
        </div>

        <div className="raise-amount-dialog-actions">
          <button 
            className="raise-amount-dialog-btn cancel"
            onClick={onCancel}
          >
            取消
          </button>
          <button 
            className="raise-amount-dialog-btn confirm"
            onClick={handleConfirm}
            disabled={!amount || error}
          >
            确认加注
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaiseAmountDialog;
