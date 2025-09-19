const { syncDatabase } = require('../models');

async function addIsMeField() {
  try {
    console.log('Adding isMe field to players table...');
    
    // Use Sequelize sync to add the new field
    // This will automatically add the isMe field to the Player model
    await syncDatabase(false); // Don't force, just add missing fields
    
    console.log('Successfully added isMe field to players table');
    process.exit(0);
  } catch (error) {
    console.error('Error adding isMe field:', error);
    process.exit(1);
  }
}

// Run the migration
addIsMeField();
