import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import './CardSelector.css';

const CardSelector = ({ 
  onCardSelect, 
  usedCards = [], 
  maxSelections = 1,
  onClose 
}) => {
  const [selectedCards, setSelectedCards] = useState([]);

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return suit;
    }
  };

  const isCardUsed = (card) => {
    return usedCards.some(usedCard => 
      usedCard.value === card.value && usedCard.suit === card.suit
    );
  };

  const isCardSelected = (card) => {
    return selectedCards.some(selectedCard => 
      selectedCard.value === card.value && selectedCard.suit === card.suit
    );
  };

  const handleCardClick = (card) => {
    if (isCardUsed(card)) return;

    if (isCardSelected(card)) {
      setSelectedCards(selectedCards.filter(selectedCard => 
        !(selectedCard.value === card.value && selectedCard.suit === card.suit)
      ));
    } else if (selectedCards.length < maxSelections) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleRemoveCard = (cardToRemove) => {
    setSelectedCards(selectedCards.filter(card => 
      !(card.value === cardToRemove.value && card.suit === cardToRemove.suit)
    ));
  };

  const handleConfirm = () => {
    if (selectedCards.length > 0) {
      onCardSelect(selectedCards[0]); // For single card selection
      setSelectedCards([]);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="card-selector-overlay" onClick={handleClose}>
      <div className="card-selector-card" onClick={(e) => e.stopPropagation()}>
        <div className="card-selector-header">
          <h2 className="card-selector-title">Select Card</h2>
          <button className="card-selector-close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="card-selector-suits">
          {suits.map(suit => (
            <div key={suit} className="card-selector-suit-section">
              <div className={`card-selector-suit-title ${suit}`}>
                {getSuitSymbol(suit)} {suit}
              </div>
              <div className="card-selector-cards-grid">
                {values.map(value => {
                  const card = { value, suit };
                  const isUsed = isCardUsed(card);
                  const isSelected = isCardSelected(card);
                  
                  return (
                    <button
                      key={`${value}-${suit}`}
                      className="card-selector-card-button"
                      onClick={() => handleCardClick(card)}
                      disabled={isUsed}
                      style={{
                        opacity: isUsed ? 0.3 : 1,
                        borderColor: isSelected ? '#4a9eff' : '#2d7a5f',
                        background: isSelected ? 'rgba(74, 158, 255, 0.1)' : 'white'
                      }}
                    >
                      <div className={`card-value ${suit}`}>{value}</div>
                      <div className={`card-suit ${suit}`}>{getSuitSymbol(suit)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedCards.length > 0 && (
          <div className="card-selector-selected-cards">
            <div className="card-selector-selected-title">
              Selected Cards ({selectedCards.length}/{maxSelections})
            </div>
            <div className="card-selector-selected-display">
              {selectedCards.map((card, index) => (
                <div key={index} className="card-selector-selected-card">
                  <div className={`card-value ${card.suit}`}>{card.value}</div>
                  <div className={`card-suit ${card.suit}`}>{getSuitSymbol(card.suit)}</div>
                  <button
                    className="card-selector-remove-button"
                    onClick={() => handleRemoveCard(card)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-selector-action-buttons">
          <button 
            type="button"
            className="card-selector-action-button secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="card-selector-action-button primary"
            onClick={handleConfirm}
            disabled={selectedCards.length === 0}
          >
            <Check size={16} />
            Select Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardSelector;