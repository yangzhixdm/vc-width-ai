const { Game, Player, Action, BehaviorProfile } = require('../models');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // 创建示例游戏
    const game = await Game.create({
      smallBlind: 10,
      bigBlind: 20,
      currentPot: 30,
      currentRound: 'preflop',
      status: 'active'
    });
    
    console.log(`✅ Created game: ${game.gameId}`);
    
    // 创建示例玩家
    const players = await Promise.all([
      Player.create({
        gameId: game.gameId,
        name: 'Human Player',
        position: 0,
        role: 'button',
        chips: 1000,
        isHuman: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=human'
      }),
      Player.create({
        gameId: game.gameId,
        name: 'AI Player 1',
        position: 1,
        role: 'sb',
        chips: 1000,
        isHuman: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai1'
      }),
      Player.create({
        gameId: game.gameId,
        name: 'AI Player 2',
        position: 2,
        role: 'bb',
        chips: 1000,
        isHuman: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai2'
      })
    ]);
    
    console.log(`✅ Created ${players.length} players`);
    
    // 创建示例行为档案
    await Promise.all(players.map(player => 
      BehaviorProfile.create({
        playerId: player.playerId,
        vpip: Math.random() * 30 + 15, // 15-45%
        pfr: Math.random() * 20 + 10,  // 10-30%
        aggressionFactor: Math.random() * 2 + 1, // 1-3
        foldToCbet: Math.random() * 40 + 40, // 40-80%
        cbetFrequency: Math.random() * 40 + 50, // 50-90%
        threeBetFrequency: Math.random() * 10 + 2, // 2-12%
        foldToThreeBet: Math.random() * 30 + 50, // 50-80%
        stealAttempts: Math.random() * 30 + 15, // 15-45%
        showdownFrequency: Math.random() * 20 + 20, // 20-40%
        winRate: Math.random() * 0.2 - 0.1, // -10% to +10%
        totalHands: Math.floor(Math.random() * 1000) + 100
      })
    ));
    
    console.log(`✅ Created behavior profiles for all players`);
    
    // 创建示例动作
    const actions = await Promise.all([
      Action.create({
        gameId: game.gameId,
        handNumber: game.handNumber,
        playerId: players[1].playerId, // sb player
        round: 'preflop',
        actionType: 'call',
        amount: 10,
        potSize: 30,
        position: 1
      }),
      Action.create({
        gameId: game.gameId,
        handNumber: game.handNumber,
        playerId: players[2].playerId, // bb player
        round: 'preflop',
        actionType: 'call',
        amount: 20,
        potSize: 30,
        position: 2
      })
    ]);
    
    console.log(`✅ Created ${actions.length} sample actions`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Sample game ID: ${game.gameId}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
