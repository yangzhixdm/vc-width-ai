import React, { useState } from 'react';
import './BuyInDialog.css';

const BuyInDialog = ({ player, onConfirm, onCancel, loading = false }) => {
  const [amount, setAmount] = useState(2000);

  const handleConfirm = () => {
    if (amount > 0) {
      onConfirm(amount);
    }
  };

  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setAmount(value);
  };

  const quickAmounts = [1000, 2000, 3000, 5000];

  if (!player) return null;

  return (
    <div className="buyin-dialog-overlay">
      <div className="buyin-dialog">
        <div className="buyin-dialog-header">
          <h3>买入筹码</h3>
          <button className="close-btn" onClick={onCancel} disabled={loading}>
            ×
          </button>
        </div>
        
        <div className="buyin-dialog-content">
          <div className="player-info">
            <div className="player-name">{player.name}</div>
            <div className="current-chips">
              当前筹码: <span className="chips-amount">{player.chips.toLocaleString()}</span>
            </div>
            <div className="total-buyin">
              总买入: <span className="buyin-amount">{player.totalBuyIn.toLocaleString()}</span>
            </div>
          </div>

          <div className="amount-section">
            <label htmlFor="amount">买入金额:</label>
            <div className="amount-input-group">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                min="1"
                max="10000"
                disabled={loading}
                className="amount-input"
              />
              <span className="amount-label">筹码</span>
            </div>
          </div>

          <div className="quick-amounts">
            <div className="quick-amounts-label">快速选择:</div>
            <div className="quick-amounts-buttons">
              {quickAmounts.map(quickAmount => (
                <button
                  key={quickAmount}
                  className={`quick-amount-btn ${amount === quickAmount ? 'active' : ''}`}
                  onClick={() => setAmount(quickAmount)}
                  disabled={loading}
                >
                  {quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="buyin-summary">
            <div className="summary-item">
              <span>买入后筹码:</span>
              <span className="summary-value">
                {(player.chips + amount).toLocaleString()}
              </span>
            </div>
            <div className="summary-item">
              <span>总买入金额:</span>
              <span className="summary-value">
                {(player.totalBuyIn + amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="buyin-dialog-actions">
          <button
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            取消
          </button>
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={loading || amount <= 0}
          >
            {loading ? '处理中...' : `买入 ${amount.toLocaleString()} 筹码`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyInDialog;
