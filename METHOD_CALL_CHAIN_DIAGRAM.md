# 德州扑克游戏方法调用链路图

## 概述
本文档详细描述了德州扑克游戏中各个组件之间的方法调用关系，帮助开发者理解代码结构和排查问题。

## 1. 游戏流程概览

```mermaid
graph TD
    A[用户访问游戏] --> B[GameTable组件加载]
    B --> C[useGame Hook初始化]
    C --> D[获取游戏状态]
    D --> E[显示游戏界面]
    E --> F[用户操作]
    F --> G[API调用]
    G --> H[后端处理]
    H --> I[数据库更新]
    I --> J[返回结果]
    J --> K[更新前端状态]
    K --> L[UI重新渲染]
```

## 2. 前端组件架构

### 2.1 主要组件层次结构

```
App.js
├── GameSetup.js (游戏设置)
└── GameTable.js (主游戏界面)
    ├── PlayerSeat.js (玩家座位)
    ├── BettingInterface.js (下注界面)
    ├── CommunityCards.js (公共牌)
    ├── PotDisplay.js (底池显示)
    ├── ChipAnimation.js (筹码动画)
    ├── SettleChipsDialog.js (结算对话框)
    └── 其他UI组件...
```

### 2.2 状态管理 (useGame Hook)

```mermaid
graph LR
    A[useGame Hook] --> B[gameState]
    A --> C[loading]
    A --> D[error]
    A --> E[aiRecommendation]
    
    B --> F[游戏数据]
    B --> G[玩家信息]
    B --> H[当前状态]
```

## 3. 关键方法调用链路

### 3.1 游戏初始化流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant GT as GameTable
    participant UG as useGame Hook
    participant API as gameAPI
    participant GC as GameController
    participant GS as GameService
    participant DB as 数据库

    U->>GT: 访问游戏页面
    GT->>UG: 调用 getGameState(gameId)
    UG->>API: gameAPI.getGameState(gameId)
    API->>GC: GET /api/games/:gameId
    GC->>GS: getGameState(gameId)
    GS->>DB: 查询游戏数据
    DB-->>GS: 返回游戏状态
    GS-->>GC: 返回游戏数据
    GC-->>API: 返回响应
    API-->>UG: 更新 gameState
    UG-->>GT: 触发重新渲染
    GT-->>U: 显示游戏界面
```

### 3.2 玩家下注流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant BI as BettingInterface
    participant GT as GameTable
    participant UG as useGame Hook
    participant API as gameAPI
    participant GC as GameController
    participant GS as GameService
    participant DB as 数据库

    U->>BI: 点击下注按钮
    BI->>GT: 调用 handlePlayerAction
    GT->>UG: 调用 makeAction(gameId, playerId, actionType, amount, round)
    UG->>API: gameAPI.makeAction(...)
    API->>GC: POST /api/games/:gameId/players/:playerId/actions
    GC->>GS: makeAction(gameId, playerId, actionType, amount, round)
    GS->>DB: 更新玩家状态和游戏状态
    DB-->>GS: 确认更新
    GS-->>GC: 返回操作结果
    GC-->>API: 返回响应
    API-->>UG: 更新 gameState
    UG-->>GT: 触发重新渲染
    GT-->>U: 显示更新后的游戏状态
```

### 3.3 游戏结算流程 (修复后的版本)

```mermaid
sequenceDiagram
    participant U as 用户
    participant GT as GameTable
    participant UG as useGame Hook
    participant API as gameAPI
    participant GC as GameController
    participant GS as GameService
    participant CA as ChipAnimation
    participant DB as 数据库

    U->>GT: 点击结算按钮
    GT->>UG: 调用 settleChips(gameId, winnerId)
    UG->>API: gameAPI.settleChips(gameId, winnerId)
    API->>GC: POST /api/games/:gameId/settle
    GC->>GS: settleChips(gameId, winnerId)
    GS->>DB: 更新获胜者筹码
    DB-->>GS: 确认更新
    GS-->>GC: 返回结算结果
    GC-->>API: 返回响应
    API-->>UG: 更新 gameState
    UG-->>GT: 返回结算结果
    
    Note over GT: 触发筹码动画
    GT->>CA: triggerPotToPlayerAnimation(winnerId, amount, callback)
    CA-->>GT: 动画完成回调
    
    Note over GT: 动画完成后自动开始下一局
    GT->>UG: 调用 handleEndHandAfterAnimation()
    UG->>API: gameAPI.endHand(gameId)
    API->>GC: POST /api/games/:gameId/end-hand
    GC->>GS: endHand(gameId)
    GS->>DB: 重置游戏状态，开始新一局
    DB-->>GS: 确认更新
    GS-->>GC: 返回新游戏状态
    GC-->>API: 返回响应
    API-->>UG: 更新 gameState
    UG-->>GT: 触发重新渲染
    GT-->>U: 显示新一局游戏
```

## 4. 后端服务架构

### 4.1 服务层结构

```mermaid
graph TD
    A[GameController] --> B[GameService]
    A --> C[AIService]
    B --> D[数据库模型]
    C --> E[Gemini AI API]
    
    D --> F[Game Model]
    D --> G[Player Model]
    D --> H[Action Model]
    D --> I[BehaviorProfile Model]
```

### 4.2 数据库模型关系

```mermaid
erDiagram
    Game ||--o{ Player : has
    Game ||--o{ Action : contains
    Player ||--o{ Action : performs
    Player ||--o| BehaviorProfile : has
    
    Game {
        uuid gameId
        string status
        int smallBlind
        int bigBlind
        int currentPot
        int currentBet
        string currentRound
        int dealerPosition
        json communityCards
        uuid winner
        uuid currentPlayerId
        int handNumber
    }
    
    Player {
        uuid id
        uuid gameId
        string name
        int position
        int chips
        json holeCards
        int currentBet
        boolean isFolded
        boolean isAllIn
        boolean isActive
        boolean isHuman
        boolean isDealer
        boolean isSmallBlind
        boolean isBigBlind
    }
    
    Action {
        uuid id
        uuid gameId
        uuid playerId
        string actionType
        int amount
        string round
        datetime timestamp
    }
    
    BehaviorProfile {
        uuid id
        uuid playerId
        string profileType
        json parameters
    }
```

## 5. API 端点映射

### 5.1 游戏管理端点

| 方法 | 端点 | 控制器方法 | 服务方法 | 描述 |
|------|------|------------|----------|------|
| POST | `/api/games` | createGame | createGame | 创建新游戏 |
| GET | `/api/games/:gameId` | getGameState | getGameState | 获取游戏状态 |
| POST | `/api/games/:gameId/players` | addPlayer | addPlayer | 添加玩家 |
| POST | `/api/games/:gameId/start` | startGame | startGame | 开始游戏 |

### 5.2 游戏操作端点

| 方法 | 端点 | 控制器方法 | 服务方法 | 描述 |
|------|------|------------|----------|------|
| POST | `/api/games/:gameId/players/:playerId/actions` | makeAction | makeAction | 玩家下注 |
| POST | `/api/games/:gameId/community-cards` | dealCommunityCards | dealCommunityCards | 发公共牌 |
| POST | `/api/games/:gameId/settle` | settleChips | settleChips | 结算筹码 |
| POST | `/api/games/:gameId/end-hand` | endHand | endHand | 结束当前手牌 |

### 5.3 AI 相关端点

| 方法 | 端点 | 控制器方法 | 服务方法 | 描述 |
|------|------|------------|----------|------|
| POST | `/api/games/:gameId/players/:playerId/ai-recommendation` | getAIRecommendation | getAIRecommendation | 获取AI建议 |

## 6. 关键状态管理

### 6.1 前端状态变量

```javascript
// GameTable.js 中的关键状态
const [gameState, setGameState] = useState(null);           // 游戏状态
const [currentPlayer, setCurrentPlayer] = useState(null);   // 当前玩家
const [chipAnimations, setChipAnimations] = useState([]);   // 筹码动画
const [pendingNextHand, setPendingNextHand] = useState(false); // 等待下一手牌
const [showdownAnimationCompleted, setShowdownAnimationCompleted] = useState(false); // 结算动画完成
```

### 6.2 游戏状态枚举

```javascript
// 游戏状态
status: 'waiting' | 'active' | 'completed' | 'cancelled'

// 游戏轮次
currentRound: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

// 玩家动作
actionType: 'fold' | 'call' | 'raise' | 'check' | 'all-in'
```

## 7. 动画系统

### 7.1 筹码动画流程

```mermaid
graph TD
    A[触发动画] --> B[triggerPotToPlayerAnimation]
    B --> C[创建动画对象]
    C --> D[添加到动画列表]
    D --> E[ChipAnimation组件渲染]
    E --> F[CSS动画执行]
    F --> G[动画完成回调]
    G --> H[从动画列表移除]
    H --> I[执行后续操作]
```

### 7.2 动画状态管理

```javascript
// 动画对象结构
const animation = {
  id: uniqueId,           // 唯一标识
  fromPosition: {x, y},   // 起始位置
  toPosition: {x, y},     // 目标位置
  amount: number,         // 筹码金额
  isVisible: boolean,     // 是否可见
  isPotToPlayer: boolean, // 是否从底池到玩家
  onComplete: function    // 完成回调
};
```

## 8. 错误处理和调试

### 8.1 常见问题排查

1. **游戏状态不同步**
   - 检查 `getGameState` 调用时机
   - 确认数据库更新是否成功
   - 验证前端状态更新逻辑

2. **动画显示异常**
   - 检查 `chipAnimations` 状态
   - 确认位置计算是否正确
   - 验证CSS动画配置

3. **API调用失败**
   - 检查网络连接
   - 验证请求参数
   - 查看服务器日志

### 8.2 调试工具

```javascript
// 在浏览器控制台中查看游戏状态
console.log('Game State:', gameState);

// 查看动画状态
console.log('Chip Animations:', chipAnimations);

// 查看当前玩家
console.log('Current Player:', currentPlayer);
```

## 9. 性能优化建议

1. **减少不必要的重新渲染**
   - 使用 `useMemo` 和 `useCallback` 优化计算
   - 合理使用 `useEffect` 依赖数组

2. **动画性能优化**
   - 使用 CSS transform 而非 position 变化
   - 避免在动画期间进行复杂计算

3. **API调用优化**
   - 实现请求去重
   - 添加适当的缓存机制

## 10. 扩展功能

### 10.1 计划中的功能

- [ ] 实时多人游戏支持
- [ ] 更丰富的AI行为模式
- [ ] 游戏回放功能
- [ ] 统计分析面板

### 10.2 技术债务

- [ ] 统一错误处理机制
- [ ] 添加单元测试
- [ ] 优化数据库查询
- [ ] 改进代码注释和文档

---

*最后更新: 2024年12月*
*版本: 1.0*
