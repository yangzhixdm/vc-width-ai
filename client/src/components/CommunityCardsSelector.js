import React, { useState } from 'react';
import CardSelector from './CardSelector';
import { Layers, Plus } from 'lucide-react';
import './CommunityCardsSelector.css';

const CommunityCardsSelector = ({ 
  round, 
  existingCards = [], 
  onConfirm, 
  onCancel, 
  usedCards = [] 
}) => {
  const [newCards, setNewCards] = useState([]);

  const getCardsToDeal = () => {
    switch (round) {
      case 'flop': return 3;
      case 'turn': return 1;
      case 'river': return 1;
      default: return 0;
    }
  };

  const cardsToDeal = getCardsToDeal();

  const handleCardSelect = (card) => {
    if (newCards.length < cardsToDeal && !newCards.some(c => c.value === card.value && c.suit === card.suit)) {
      setNewCards([...newCards, card]);
    }
  };

  const handleCardRemove = (index) => {
    setNewCards(newCards.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (newCards.length === cardsToDeal) {
      onConfirm([...existingCards, ...newCards]);
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

  const getRoundDisplay = (round) => {
    switch (round) {
      case 'flop': return 'Deal Flop';
      case 'turn': return 'Deal Turn';
      case 'river': return 'Deal River';
      default: return 'Deal Cards';
    }
  };

  const getRoundDescription = (round) => {
    switch (round) {
      case 'flop': return 'Deal 3 community cards';
      case 'turn': return 'Deal 1 community card';
      case 'river': return 'Deal 1 community card';
      default: return 'Deal community cards';
    }
  };

  return (
    <div className="community-cards-selector-overlay" onClick={onCancel}>
      <div className="community-cards-selector-card" onClick={(e) => e.stopPropagation()}>
        <div className="community-cards-selector-header">
          <div className="community-cards-selector-icon">
            <Layers size={24} color="white" />
          </div>
          <h2 className="community-cards-selector-title">{getRoundDisplay(round)}</h2>
        </div>

        <div className="community-cards-selector-round-info">
          <div className="community-cards-selector-round-title">{getRoundDisplay(round)}</div>
          <div className="community-cards-selector-round-description">{getRoundDescription(round)}</div>
        </div>

        {existingCards.length > 0 && (
          <div className="community-cards-selector-existing-cards">
            <div className="community-cards-selector-existing-title">Existing Community Cards</div>
            <div className="community-cards-selector-cards-display">
              {existingCards.map((card, index) => {
                const cardDisplay = getCardDisplay(card);
                return (
                  <div key={index} className="community-cards-selector-card-slot">
                    <div className={`card-value ${cardDisplay.suit}`}>
                      {cardDisplay.value}
                    </div>
                    <div className={`card-suit ${cardDisplay.suit}`}>
                      {cardDisplay.symbol}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="community-cards-selector-new-cards">
          <div className="community-cards-selector-new-title">
            New Cards to Deal ({newCards.length}/{cardsToDeal})
          </div>
          <div className="community-cards-selector-new-cards-display">
            {Array.from({ length: cardsToDeal }, (_, index) => {
              const card = newCards[index];
              const cardDisplay = getCardDisplay(card);
              
              return (
                <div
                  key={index}
                  className={`community-cards-selector-new-card-slot ${card ? 'filled' : ''}`}
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
          usedCards={[...usedCards, ...existingCards, ...newCards]}
          maxSelections={cardsToDeal - newCards.length}
        />

        <div className="community-cards-selector-action-buttons">
          <button 
            type="button"
            className="community-cards-selector-action-button secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="community-cards-selector-action-button primary"
            onClick={handleConfirm}
            disabled={newCards.length !== cardsToDeal}
          >
            Deal Cards
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCardsSelector;