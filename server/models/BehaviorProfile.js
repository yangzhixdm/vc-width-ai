const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BehaviorProfile = sequelize.define('BehaviorProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  vpip: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Voluntarily Put $ In Pot percentage'
  },
  pfr: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Pre-Flop Raise percentage'
  },
  aggressionFactor: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  foldToCbet: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Fold to Continuation Bet percentage'
  },
  cbetFrequency: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Continuation Bet frequency'
  },
  threeBetFrequency: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  foldToThreeBet: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  stealAttempts: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Steal attempt frequency from late position'
  },
  showdownFrequency: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  winRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  totalHands: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'behavior_profiles',
  timestamps: true
});

module.exports = BehaviorProfile;
