# Texas Hold'em AI Assistant

A full-stack Texas Hold'em poker game with AI-powered betting recommendations using OpenAI's GPT models.

## Features

- 🎮 **Interactive Poker Table**: Circular table layout with player avatars and positions
- 🤖 **AI-Powered Recommendations**: Get betting advice based on opponent behavior analysis
- 📊 **Behavior Tracking**: Comprehensive player behavior profiling and statistics
- 🎯 **Smart Betting Interface**: Pot size suggestions and intuitive betting controls
- 💾 **Data Persistence**: Store game history and player behavior for AI analysis
- 🎨 **Modern UI**: Beautiful, responsive interface with smooth animations

## Tech Stack

### Backend
- **Node.js** with **Koa2** framework
- **MySQL** database with **Sequelize** ORM
- **OpenAI GPT-4o-mini** for AI recommendations
- RESTful API architecture

### Frontend
- **React 18** with functional components and hooks
- **Styled Components** for CSS-in-JS styling
- **Axios** for API communication
- Responsive design with modern UI/UX

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- OpenAI API key

### Setup

#### 🚀 快速设置（推荐）
```bash
# 1. 克隆仓库
git clone <repository-url>
cd vc-width-ai

# 2. 运行自动设置脚本
./setup.sh
```

#### 📋 手动设置

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vc-width-ai
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment**
   ```bash
   cd server
   cp config.example.js config.js
   ```
   
   Edit `server/config.js` with your database and OpenAI API credentials:
   ```javascript
   module.exports = {
     database: {
       host: 'localhost',
       port: 3306,
       database: 'texas_holdem_ai',
       username: 'your_username',
       password: 'your_password',
       dialect: 'mysql'
     },
     openai: {
       apiKey: 'your_openai_api_key'
     },
     server: {
       port: 3001,
       env: 'development'
     }
   };
   ```

4. **Initialize database**
   ```bash
   # 创建数据库和表结构，并添加示例数据
   npm run setup-db
   
   # 或者分步执行
   npm run init-db    # 仅创建数据库和表
   npm run seed-db    # 添加示例数据
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the server (port 3001) and client (port 3000).

#### 🗄️ 数据库管理命令
```bash
npm run init-db     # 初始化数据库和表结构
npm run reset-db    # 重置数据库（删除所有表）
npm run seed-db     # 添加示例数据
npm run setup-db    # 完整设置（init + seed）
```

## Game Flow

### 1. Game Setup
- Create a new game with custom blind levels
- Add 2-8 players (first player is human, others are AI)
- Configure player names and avatars

### 2. Gameplay
- **Pre-flop**: Players receive hole cards, blinds are posted
- **Flop**: 3 community cards are dealt
- **Turn**: 1 additional community card
- **River**: Final community card
- **Showdown**: Best hand wins

### 3. AI Integration
- Request AI recommendations before making moves
- AI analyzes opponent behavior patterns
- Get confidence levels and reasoning for recommendations
- Accept or reject AI suggestions

### 4. Betting Actions
- **Check**: Pass when no bet to call
- **Call**: Match the current bet
- **Raise**: Increase the bet amount
- **Fold**: Give up the hand

## API Endpoints

### Games
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game state
- `POST /api/games/:id/players` - Add player
- `POST /api/games/:id/start` - Start game

### Actions
- `POST /api/games/:id/players/:playerId/actions` - Make player action
- `POST /api/games/:id/community-cards` - Deal community cards

### AI
- `POST /api/games/:id/players/:playerId/ai-recommendation` - Get AI recommendation
- `GET /api/games/:id/pot-suggestions` - Get pot size suggestions

## Database Schema

### Games
- Game state, pot size, current round, community cards
- Blind levels and dealer position

### Players
- Player information, chips, position, role
- Hole cards and current bet status

### Actions
- All player actions with timestamps
- AI recommendations and acceptance status

### Behavior Profiles
- VPIP, PFR, aggression factor
- Fold rates, betting patterns
- Win rates and hand statistics

## AI Analysis

The AI system analyzes:
- **Player Behavior Patterns**: VPIP, PFR, aggression factor
- **Positional Play**: Early, middle, late position tendencies
- **Betting Patterns**: Continuation bets, three-bets, steal attempts
- **Game Context**: Pot odds, stack sizes, community cards
- **Historical Data**: Previous actions and outcomes

## Development

### Project Structure
```
vc-width-ai/
├── server/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── config/            # Configuration
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
└── package.json           # Root package.json
```

### Available Scripts
- `npm run dev` - Start both server and client
- `npm run server` - Start server only
- `npm run client` - Start client only
- `npm run build` - Build client for production
- `npm run install-all` - Install all dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Future Enhancements

- [ ] Real-time multiplayer with WebSockets
- [ ] Tournament mode with multiple tables
- [ ] Advanced AI models with hand strength evaluation
- [ ] Mobile app with React Native
- [ ] Voice commands for hands-free play
- [ ] Integration with poker training sites
- [ ] Advanced statistics and analytics dashboard
