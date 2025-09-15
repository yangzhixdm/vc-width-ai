const Router = require('koa-router');
const GameController = require('../controllers/GameController');

const router = new Router({
  prefix: '/api/games'
});

// Game management routes
router.post('/', GameController.createGame);
router.get('/:gameId', GameController.getGameState);
router.post('/:gameId/players', GameController.addPlayer);
router.post('/:gameId/start', GameController.startGame);

// Game action routes
router.post('/:gameId/players/:playerId/actions', GameController.makeAction);
router.post('/:gameId/community-cards', GameController.dealCommunityCards);

// AI and utility routes
router.post('/:gameId/players/:playerId/ai-recommendation', GameController.getAIRecommendation);
router.get('/:gameId/pot-suggestions', GameController.getPotSizeSuggestions);

// Card management routes
router.post('/:gameId/players/:playerId/hole-cards', GameController.setHoleCards);
router.post('/:gameId/community-cards', GameController.setCommunityCards);

module.exports = router;
