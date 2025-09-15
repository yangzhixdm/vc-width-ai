const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('sb', 'bb', 'utg', 'utg+1', 'cutoff', 'button', 'regular'),
    defaultValue: 'regular'
  },
  chips: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  currentBet: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  holeCards: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isHuman: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFolded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAllIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'players',
  timestamps: true
});

module.exports = Player;
