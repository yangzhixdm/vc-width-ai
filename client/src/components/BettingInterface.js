import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { X, DollarSign } from 'lucide-react';
import './BettingInterface.css';

const BettingInterface = ({ game, player, onAction, onClose }) => {
  const { getPotSizeSuggestions } = useGame();
  const [potSuggestions, setPotSuggestions] = useState({});
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPotSuggestions = async () => {
      try {
        const suggestions = await getPotSizeSuggestions(game.id);
        setPotSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load pot suggestions:', error);
      }
    };

    loadPotSuggestions();
  }, [game.id, getPotSizeSuggestions]);

  const handleAction = async (actionType, amount = 0) => {
    setLoading(true);
    try {
      await onAction(actionType, amount);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(parseInt(value) || 0);
  };

  const canCheck = game.currentBet === 0 || player.currentBet >= game.currentBet;
  const callAmount = Math.max(0, game.currentBet - player.currentBet);
  const minRaise = game.currentBet + (game.currentBet > 0 ? game.currentBet : game.bigBlind);

  return (
    <div className="betting-interface-overlay" onClick={onClose}>
      <div className="betting-interface-card" onClick={(e) => e.stopPropagation()}>
        <div className="betting-interface-header">
          <h2 className="betting-interface-title">Make Your Move</h2>
          <button className="betting-interface-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="betting-interface-player-info">
          <div className="betting-interface-player-name">{player.name}</div>
          <div className="betting-interface-player-stats">
            <div className="betting-interface-stat-item">
              <span>Chips:</span>
              <span>${player.chips}</span>
            </div>
            <div className="betting-interface-stat-item">
              <span>Current Bet:</span>
              <span>${player.currentBet}</span>
            </div>
            <div className="betting-interface-stat-item">
              <span>Pot:</span>
              <span>${game.currentPot}</span>
            </div>
            <div className="betting-interface-stat-item">
              <span>To Call:</span>
              <span>${callAmount}</span>
            </div>
          </div>
        </div>

        <div className="betting-interface-action-buttons">
          {canCheck ? (
            <button 
              className="betting-interface-action-button check"
              onClick={() => handleAction('check')}
              disabled={loading}
            >
              Check
            </button>
          ) : (
            <button 
              className="betting-interface-action-button call"
              onClick={() => handleAction('call', callAmount)}
              disabled={loading || callAmount > player.chips}
            >
              Call ${callAmount}
            </button>
          )}

          <button 
            className="betting-interface-action-button fold"
            onClick={() => handleAction('fold')}
            disabled={loading}
          >
            Fold
          </button>
        </div>

        <div className="betting-interface-bet-section">
          <h3 className="betting-interface-bet-label">Raise Amount</h3>
          
          <div className="betting-interface-bet-buttons">
            {Object.entries(potSuggestions).map(([label, amount]) => (
              <button
                key={label}
                className={`betting-interface-bet-button ${selectedAmount === amount ? 'active' : ''}`}
                onClick={() => handleSuggestionClick(amount)}
              >
                {label}: ${amount}
              </button>
            ))}
          </div>

          <div className="betting-interface-pot-info">
            <div className="betting-interface-pot-label">Custom Amount</div>
            <div className="betting-interface-pot-amount">
              <input
                className="betting-interface-bet-input"
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                min={minRaise}
                max={player.chips}
              />
              <button
                className="betting-interface-submit-button"
                onClick={() => handleAction('raise', selectedAmount)}
                disabled={loading || selectedAmount < minRaise || selectedAmount > player.chips}
              >
                <DollarSign size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingInterface;
