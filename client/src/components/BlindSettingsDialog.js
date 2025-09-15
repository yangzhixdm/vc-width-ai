import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import './BlindSettingsDialog.css';

const BlindSettingsDialog = ({ 
  currentSmallBlind = 10,
  currentBigBlind = 20,
  onSave, 
  onCancel, 
  loading = false 
}) => {
  const [smallBlind, setSmallBlind] = useState(currentSmallBlind);
  const [bigBlind, setBigBlind] = useState(currentBigBlind);

  const presets = [
    { label: 'Low Stakes', small: 5, big: 10 },
    { label: 'Medium Stakes', small: 10, big: 20 },
    { label: 'High Stakes', small: 25, big: 50 },
    { label: 'Tournament', small: 50, big: 100 }
  ];

  const handlePresetClick = (preset) => {
    setSmallBlind(preset.small);
    setBigBlind(preset.big);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (smallBlind > 0 && bigBlind > smallBlind) {
      onSave({ smallBlind, bigBlind });
    }
  };

  return (
    <div className="blind-settings-dialog-overlay" onClick={onCancel}>
      <div className="blind-settings-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="blind-settings-dialog-header">
          <h2 className="blind-settings-dialog-title">
            <Settings size={24} />
            Blind Settings
          </h2>
          <button className="blind-settings-dialog-close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="blind-settings-dialog-form-group">
            <label className="blind-settings-dialog-label">Preset Blind Levels</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={`blind-settings-dialog-action-button ${smallBlind === preset.small && bigBlind === preset.big ? 'active' : ''}`}
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    padding: '10px 15px',
                    border: '2px solid #2d7a5f',
                    borderRadius: '8px',
                    background: smallBlind === preset.small && bigBlind === preset.big ? 'rgba(74, 158, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: smallBlind === preset.small && bigBlind === preset.big ? 'white' : '#d4c4a8',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  {preset.label}
                  <br />
                  <small>${preset.small}/${preset.big}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="blind-settings-dialog-form-group">
            <label className="blind-settings-dialog-label">Small Blind</label>
            <input
              className="blind-settings-dialog-input"
              type="number"
              placeholder="Enter small blind amount"
              value={smallBlind}
              onChange={(e) => setSmallBlind(parseInt(e.target.value) || 0)}
              min="1"
              disabled={loading}
              required
            />
          </div>

          <div className="blind-settings-dialog-form-group">
            <label className="blind-settings-dialog-label">Big Blind</label>
            <input
              className="blind-settings-dialog-input"
              type="number"
              placeholder="Enter big blind amount"
              value={bigBlind}
              onChange={(e) => setBigBlind(parseInt(e.target.value) || 0)}
              min={smallBlind + 1}
              disabled={loading}
              required
            />
          </div>

          <div className="blind-settings-dialog-action-buttons">
            <button 
              type="button"
              className="blind-settings-dialog-action-button secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="blind-settings-dialog-action-button primary"
              disabled={loading || smallBlind <= 0 || bigBlind <= smallBlind}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlindSettingsDialog;