const sequelize = require('../config/database');

async function addTotalBuyInField() {
  try {
    console.log('Adding totalBuyIn field to players table...');
    
    // 添加 totalBuyIn 字段
    await sequelize.query(`
      ALTER TABLE players 
      ADD COLUMN totalBuyIn INTEGER DEFAULT 2000 
      COMMENT '玩家总共买入的筹码数量'
    `);
    
    // 更新现有玩家的 totalBuyIn 字段
    await sequelize.query(`
      UPDATE players 
      SET totalBuyIn = 2000 
      WHERE totalBuyIn IS NULL
    `);
    
    console.log('✅ Successfully added totalBuyIn field to players table');
    console.log('✅ Updated existing players with default totalBuyIn value');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  totalBuyIn field already exists, skipping...');
    } else {
      console.error('❌ Error adding totalBuyIn field:', error.message);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  addTotalBuyInField()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addTotalBuyInField;
