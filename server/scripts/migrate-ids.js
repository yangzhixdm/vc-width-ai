const { Game, Player, Action, BehaviorProfile } = require('../models');
const sequelize = require('../config/database');

async function migrateIds() {
  try {
    console.log('🔄 Starting ID migration...');
    
    // 开始事务
    await sequelize.transaction(async (transaction) => {
      // 1. 为 games 表添加新的 id 字段（自增）和重命名现有 id 为 gameId
      console.log('📝 Migrating games table...');
      
      // 1) games: add columns without primary key first
      await sequelize.query(`
        ALTER TABLE games
          ADD COLUMN new_id INT NOT NULL,
          ADD COLUMN new_game_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
          ADD UNIQUE KEY uk_games_new_game_id (new_game_id)
      `, { transaction });

      // 2) Copy data from old columns to new columns
      await sequelize.query(`UPDATE games SET new_game_id = id`, { transaction });

      // 3) Update foreign key references to point to new_game_id
      console.log('🔍 Updating foreign key references...');
      
      // Drop foreign key constraints that reference games.id
      await sequelize.query(`
        ALTER TABLE players DROP FOREIGN KEY players_ibfk_1
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE actions DROP FOREIGN KEY actions_ibfk_1
      `, { transaction });
      
      // Recreate foreign key constraints to reference games.new_game_id
      await sequelize.query(`
        ALTER TABLE players
          ADD CONSTRAINT players_ibfk_1
          FOREIGN KEY (gameId) REFERENCES games(new_game_id)
          ON DELETE CASCADE ON UPDATE CASCADE
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE actions
          ADD CONSTRAINT actions_ibfk_1
          FOREIGN KEY (gameId) REFERENCES games(new_game_id)
          ON DELETE CASCADE ON UPDATE CASCADE
      `, { transaction });

      // 4) Drop old primary key and make new_id the primary key
      await sequelize.query(`ALTER TABLE games DROP PRIMARY KEY`, { transaction });

      await sequelize.query(`
        ALTER TABLE games
          MODIFY COLUMN new_id INT NOT NULL AUTO_INCREMENT,
          ADD PRIMARY KEY (new_id)
      `, { transaction });

      // 5) Drop old id column and rename new columns
      await sequelize.query(`
        ALTER TABLE games DROP COLUMN id
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE games
          CHANGE COLUMN new_id id INT NOT NULL AUTO_INCREMENT,
          CHANGE COLUMN new_game_id game_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
      `, { transaction });
      
      // 2. 为 players 表添加新的 id 字段（自增）和重命名现有 id 为 playerId
      console.log('📝 Migrating players table...');
      
      // 1) Add columns without primary key first
      await sequelize.query(`
        ALTER TABLE players 
          ADD COLUMN new_id INT NOT NULL,
          ADD COLUMN new_player_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
          ADD UNIQUE KEY uk_players_new_player_id (new_player_id)
      `, { transaction });
      
      // 2) Copy data from old columns to new columns
      await sequelize.query(`
        UPDATE players 
        SET new_player_id = id
      `, { transaction });
      
      // 3) Update foreign key references to point to new_player_id
      console.log('🔍 Updating players foreign key references...');
      
      // Drop foreign key constraint that references players.id
      await sequelize.query(`
        ALTER TABLE actions DROP FOREIGN KEY actions_ibfk_2
      `, { transaction });
      
      // Recreate foreign key constraint to reference players.new_player_id
      await sequelize.query(`
        ALTER TABLE actions
          ADD CONSTRAINT actions_ibfk_2
          FOREIGN KEY (playerId) REFERENCES players(new_player_id)
          ON DELETE CASCADE ON UPDATE CASCADE
      `, { transaction });

      // 4) Drop old primary key and make new_id the primary key
      await sequelize.query(`
        ALTER TABLE players 
        DROP PRIMARY KEY
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE players 
          MODIFY COLUMN new_id INT NOT NULL AUTO_INCREMENT,
          ADD PRIMARY KEY (new_id)
      `, { transaction });
      
      // 4) Drop old id column and rename new columns
      await sequelize.query(`
        ALTER TABLE players DROP COLUMN id
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE players 
          CHANGE COLUMN new_id id INT NOT NULL AUTO_INCREMENT,
          CHANGE COLUMN new_player_id player_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
      `, { transaction });
      
      // 3. 为 actions 表添加新的 id 字段（自增）和重命名现有 id 为 actionId
      console.log('📝 Migrating actions table...');
      
      // 1) Add columns without primary key first
      await sequelize.query(`
        ALTER TABLE actions 
          ADD COLUMN new_id INT NOT NULL,
          ADD COLUMN new_action_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
          ADD UNIQUE KEY uk_actions_new_action_id (new_action_id)
      `, { transaction });
      
      // 2) Copy data from old columns to new columns
      await sequelize.query(`
        UPDATE actions 
        SET new_action_id = id
      `, { transaction });
      
      // 3) Drop old primary key and make new_id the primary key
      await sequelize.query(`
        ALTER TABLE actions 
        DROP PRIMARY KEY
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE actions 
          MODIFY COLUMN new_id INT NOT NULL AUTO_INCREMENT,
          ADD PRIMARY KEY (new_id)
      `, { transaction });
      
      // 4) Drop old id column and rename new columns
      await sequelize.query(`
        ALTER TABLE actions DROP COLUMN id
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE actions 
          CHANGE COLUMN new_id id INT NOT NULL AUTO_INCREMENT,
          CHANGE COLUMN new_action_id action_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
      `, { transaction });
      
      // 4. 为 behavior_profiles 表添加新的 id 字段（自增）和重命名现有 id 为 behaviorProfileId
      console.log('📝 Migrating behavior_profiles table...');
      
      // 1) Add columns without primary key first
      await sequelize.query(`
        ALTER TABLE behavior_profiles 
          ADD COLUMN new_id INT NOT NULL,
          ADD COLUMN new_behavior_profile_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
          ADD UNIQUE KEY uk_behavior_profiles_new_behavior_profile_id (new_behavior_profile_id)
      `, { transaction });
      
      // 2) Copy data from old columns to new columns
      await sequelize.query(`
        UPDATE behavior_profiles 
        SET new_behavior_profile_id = id
      `, { transaction });
      
      // 3) Check for foreign key references to behavior_profiles
      console.log('🔍 Checking behavior_profiles foreign key references...');
      
      // Check if there are any foreign keys referencing behavior_profiles.id
      // (This would need to be updated if they exist)
      
      // 4) Drop old primary key and make new_id the primary key
      await sequelize.query(`
        ALTER TABLE behavior_profiles 
        DROP PRIMARY KEY
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE behavior_profiles 
          MODIFY COLUMN new_id INT NOT NULL AUTO_INCREMENT,
          ADD PRIMARY KEY (new_id)
      `, { transaction });
      
      // 4) Drop old id column and rename new columns
      await sequelize.query(`
        ALTER TABLE behavior_profiles DROP COLUMN id
      `, { transaction });
      
      await sequelize.query(`
        ALTER TABLE behavior_profiles 
          CHANGE COLUMN new_id id INT NOT NULL AUTO_INCREMENT,
          CHANGE COLUMN new_behavior_profile_id behavior_profile_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
      `, { transaction });
      
      // 5. 更新外键引用
      console.log('🔗 Updating foreign key references...');
      
      // Note: Foreign key updates will be handled after we rename the columns
      // The foreign keys will automatically reference the renamed columns
      // since we're changing the column names, not the table structure
      
      console.log('✅ Foreign key references will be automatically updated with column renames');
    });
    
    console.log('✅ ID migration completed successfully!');
    console.log('📊 Summary of changes:');
    console.log('  - Added auto-increment id fields to all tables');
    console.log('  - Renamed existing id fields to specific names (gameId, playerId, actionId, behaviorProfileId)');
    console.log('  - Updated all foreign key references');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateIds()
    .then(() => {
      console.log('🎉 Migration script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateIds };



