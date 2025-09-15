const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Action = sequelize.define('Action', {
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
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  round: {
    type: DataTypes.ENUM('preflop', 'flop', 'turn', 'river'),
    allowNull: false
  },
  actionType: {
    type: DataTypes.ENUM('check', 'call', 'raise', 'fold', 'all-in'),
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  potSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  holeCards: {
    type: DataTypes.JSON,
    allowNull: true
  },
  communityCards: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isAIRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aiRecommendation: {
    type: DataTypes.JSON,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'actions',
  timestamps: true
});

module.exports = Action;
