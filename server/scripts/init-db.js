const { Sequelize } = require('sequelize');
const config = require('../config');

// 创建数据库连接（不指定数据库名）
const sequelize = new Sequelize('', config.database.username, config.database.password, {
  host: config.database.host,
  port: config.database.port,
  dialect: config.database.dialect,
  logging: console.log
});

async function createDatabase() {
  try {
    // 创建数据库
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${config.database.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${config.database.database}' created successfully`);
    
    // 关闭连接
    await sequelize.close();
    
    // 重新连接并同步表结构
    const { syncDatabase } = require('../models');
    await syncDatabase();
    
    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

createDatabase();
