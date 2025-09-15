const sequelize = require('../config/database');
const Game = require('./Game');
const Player = require('./Player');
const Action = require('./Action');
const BehaviorProfile = require('./BehaviorProfile');

// Define associations
Game.hasMany(Player, { foreignKey: 'gameId', as: 'players' });
Player.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

Game.hasMany(Action, { foreignKey: 'gameId', as: 'actions' });
Action.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

Player.hasMany(Action, { foreignKey: 'playerId', as: 'actions' });
Action.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

Player.hasOne(BehaviorProfile, { foreignKey: 'playerId', as: 'behaviorProfile' });
BehaviorProfile.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    if (force) {
      // 强制重新创建所有表（开发环境）
      await sequelize.sync({ force: true });
      console.log('Database force synchronized successfully');
    } else {
      // 仅创建不存在的表，不修改现有表结构
      await sequelize.sync();
      console.log('Database synchronized successfully');
    }
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  Game,
  Player,
  Action,
  BehaviorProfile,
  syncDatabase
};
