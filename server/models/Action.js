const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Action = sequelize.define('Action', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  actionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'gameId'
    }
  },
  handNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '手牌编号，用于标识同一局游戏中的不同手牌'
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'playerId'
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
