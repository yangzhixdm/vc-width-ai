const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gameId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
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
  name: {
    type: DataTypes.STRING,
    allowNull: true
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
  currentPlayerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  handNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1
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
