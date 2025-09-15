const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const { syncDatabase } = require('./models');

// Import routes
const gameRoutes = require('./routes/game');

const app = new Koa();
const router = new Router();

// Middleware
app.use(cors());
app.use(bodyParser());

// Routes
router.use(gameRoutes.routes());

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.body = { status: 'OK', timestamp: new Date().toISOString() };
});

app.use(router.routes());
app.use(router.allowedMethods());

// Error handling middleware
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
