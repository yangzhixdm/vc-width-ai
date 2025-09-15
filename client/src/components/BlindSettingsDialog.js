import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Settings } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const DialogCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #f4e4bc;
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #d4c4a8;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #d4c4a8;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #2d7a5f;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a9eff;
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PresetButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const PresetButton = styled.button`
  padding: 10px 15px;
  border: 2px solid #2d7a5f;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #d4c4a8;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.1);
    color: white;
  }

  &.active {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.2);
    color: white;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.btn-primary {
    background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
  }

  &.btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

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
    <Overlay onClick={onCancel}>
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Settings size={24} />
            Blind Settings
          </Title>
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Preset Blind Levels</Label>
            <PresetButtons>
              {presets.map((preset) => (
                <PresetButton
                  key={preset.label}
                  type="button"
                  className={smallBlind === preset.small && bigBlind === preset.big ? 'active' : ''}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                  <br />
                  <small>${preset.small}/${preset.big}</small>
                </PresetButton>
              ))}
            </PresetButtons>
          </FormGroup>

          <FormGroup>
            <Label>Small Blind</Label>
            <Input
              type="number"
              placeholder="Enter small blind amount"
              value={smallBlind}
              onChange={(e) => setSmallBlind(parseInt(e.target.value) || 0)}
              min="1"
              disabled={loading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Big Blind</Label>
            <Input
              type="number"
              placeholder="Enter big blind amount"
              value={bigBlind}
              onChange={(e) => setBigBlind(parseInt(e.target.value) || 0)}
              min={smallBlind + 1}
              disabled={loading}
              required
            />
          </FormGroup>

          <ActionButtons>
            <ActionButton 
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </ActionButton>
            <ActionButton 
              type="submit"
              className="btn-primary"
              disabled={loading || smallBlind <= 0 || bigBlind <= smallBlind}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </ActionButton>
          </ActionButtons>
        </form>
      </DialogCard>
    </Overlay>
  );
};

export default BlindSettingsDialog;
