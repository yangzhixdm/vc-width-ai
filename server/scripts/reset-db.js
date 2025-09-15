const { Sequelize } = require('sequelize');
const config = require('../config');

// 创建数据库连接
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: console.log
  }
);

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // 删除所有表
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.query('DROP TABLE IF EXISTS actions;');
    await sequelize.query('DROP TABLE IF EXISTS behavior_profiles;');
    await sequelize.query('DROP TABLE IF EXISTS players;');
    await sequelize.query('DROP TABLE IF EXISTS games;');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('🗑️  All tables dropped');
    
    // 重新同步表结构
    const { syncDatabase } = require('../models');
    await syncDatabase();
    
    console.log('🎉 Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
