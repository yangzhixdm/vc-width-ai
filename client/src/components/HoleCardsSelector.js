import React, { useState } from 'react';
import CardSelector from './CardSelector';
import { CreditCard, User } from 'lucide-react';
import './HoleCardsSelector.css';

const HoleCardsSelector = ({ 
  player, 
  onConfirm, 
  onCancel, 
  usedCards = [] 
}) => {
  const [selectedCards, setSelectedCards] = useState([]);

  const handleCardSelect = (card) => {
    if (selectedCards.length < 2 && !selectedCards.some(c => c.value === card.value && c.suit === card.suit)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleCardRemove = (index) => {
    setSelectedCards(selectedCards.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (selectedCards.length === 2) {
      onConfirm(selectedCards);
    }
  };

  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return suit;
    }
  };

  const getCardDisplay = (card) => {
    if (!card) return null;
    return {
      value: card.value,
      suit: card.suit,
      symbol: getSuitSymbol(card.suit)
    };
  };

  return (
    <div className="hole-cards-selector-overlay" onClick={onCancel}>
      <div className="hole-cards-selector-card" onClick={(e) => e.stopPropagation()}>
        <div className="hole-cards-selector-header">
          <div className="hole-cards-selector-icon">
            <CreditCard size={24} color="white" />
          </div>
          <h2 className="hole-cards-selector-title">Set Hole Cards</h2>
        </div>

        <div className="hole-cards-selector-player-info">
          <div className="hole-cards-selector-player-avatar">
            <User size={24} color="white" />
          </div>
          <div className="hole-cards-selector-player-details">
            <div className="hole-cards-selector-player-name">
              {player.name}
              {player.isHuman && ' (You)'}
            </div>
            <div className="hole-cards-selector-player-chips">
              ${player.chips}
            </div>
          </div>
        </div>

        <div className="hole-cards-selector-selected-cards">
          <div className="hole-cards-selector-selected-title">Selected Cards (2/2)</div>
          <div className="hole-cards-selector-cards-display">
            {[0, 1].map((index) => {
              const card = selectedCards[index];
              const cardDisplay = getCardDisplay(card);
              
              return (
                <div
                  key={index}
                  className={`hole-cards-selector-card-slot ${card ? 'filled' : ''}`}
                  onClick={() => card && handleCardRemove(index)}
                >
                  {cardDisplay ? (
                    <div>
                      <div className={`card-value ${cardDisplay.suit}`}>
                        {cardDisplay.value}
                      </div>
                      <div className={`card-suit ${cardDisplay.suit}`}>
                        {cardDisplay.symbol}
                      </div>
                    </div>
                  ) : (
                    <div>Empty</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <CardSelector
          onCardSelect={handleCardSelect}
          usedCards={[...usedCards, ...selectedCards]}
          maxSelections={2 - selectedCards.length}
        />

        <div className="hole-cards-selector-action-buttons">
          <button 
            type="button"
            className="hole-cards-selector-action-button secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="hole-cards-selector-action-button primary"
            onClick={handleConfirm}
            disabled={selectedCards.length !== 2}
          >
            Confirm Cards
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoleCardsSelector;