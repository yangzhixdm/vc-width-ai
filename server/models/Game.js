const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('waiting', 'active', 'completed', 'cancelled'),
    defaultValue: 'waiting'
  },
  smallBlind: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  bigBlind: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  currentPot: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentBet: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentRound: {
    type: DataTypes.ENUM('preflop', 'flop', 'turn', 'river', 'showdown'),
    defaultValue: 'preflop'
  },
  dealerPosition: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  communityCards: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  winner: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'games',
  timestamps: true
});

module.exports = Game;
