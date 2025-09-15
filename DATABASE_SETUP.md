# 数据库初始化指南

## 📋 前置要求

1. **MySQL 8.0+** 已安装并运行
2. **Node.js 16+** 已安装
3. **项目依赖** 已安装 (`npm run install-all`)

## ⚙️ 配置步骤

### 1. 配置数据库连接

复制配置文件模板：
```bash
cd server
cp config.example.js config.js
```

编辑 `server/config.js` 文件，填入你的数据库信息：
```javascript
module.exports = {
  database: {
    host: 'localhost',        // MySQL 主机地址
    port: 3306,              // MySQL 端口
    database: 'texas_holdem_ai', // 数据库名称
    username: 'root',        // MySQL 用户名
    password: 'your_password', // MySQL 密码
    dialect: 'mysql'
  },
  openai: {
    apiKey: 'your_openai_api_key' // OpenAI API 密钥
  },
  server: {
    port: 3001,
    env: 'development'
  }
};
```

### 2. 数据库初始化命令

#### 🆕 首次初始化（推荐）
```bash
# 创建数据库并添加示例数据
npm run setup-db
```

#### 🔧 分步操作
```bash
# 1. 仅创建数据库和表结构
npm run init-db

# 2. 添加示例数据（可选）
npm run seed-db
```

#### 🔄 重置数据库
```bash
# 删除所有表并重新创建
npm run reset-db
```

## 📊 数据库结构

初始化后会自动创建以下表：

### `games` - 游戏表
- `id` - 游戏唯一标识
- `status` - 游戏状态 (waiting/active/completed/cancelled)
- `smallBlind` - 小盲注金额
- `bigBlind` - 大盲注金额
- `currentPot` - 当前底池
- `currentBet` - 当前下注
- `currentRound` - 当前轮次 (preflop/flop/turn/river/showdown)
- `dealerPosition` - 庄家位置
- `communityCards` - 公共牌
- `winner` - 获胜者ID

### `players` - 玩家表
- `id` - 玩家唯一标识
- `gameId` - 所属游戏ID
- `name` - 玩家姓名
- `avatar` - 头像URL
- `position` - 座位位置
- `role` - 角色 (sb/bb/utg/cutoff/button/regular)
- `chips` - 筹码数量
- `currentBet` - 当前下注
- `holeCards` - 手牌
- `isActive` - 是否活跃
- `isHuman` - 是否人类玩家
- `isFolded` - 是否弃牌
- `isAllIn` - 是否全下

### `actions` - 动作表
- `id` - 动作唯一标识
- `gameId` - 游戏ID
- `playerId` - 玩家ID
- `round` - 轮次
- `actionType` - 动作类型 (check/call/raise/fold/all-in)
- `amount` - 下注金额
- `potSize` - 底池大小
- `position` - 玩家位置
- `holeCards` - 手牌
- `communityCards` - 公共牌
- `isAIRecommended` - 是否AI推荐
- `aiRecommendation` - AI推荐详情

### `behavior_profiles` - 行为档案表
- `id` - 档案唯一标识
- `playerId` - 玩家ID
- `vpip` - 主动投钱入池率
- `pfr` - 翻牌前加注率
- `aggressionFactor` - 激进因子
- `foldToCbet` - 面对持续下注弃牌率
- `cbetFrequency` - 持续下注频率
- `threeBetFrequency` - 3-bet频率
- `foldToThreeBet` - 面对3-bet弃牌率
- `stealAttempts` - 偷盲尝试频率
- `showdownFrequency` - 摊牌频率
- `winRate` - 胜率
- `totalHands` - 总手数

## 🚀 启动应用

数据库初始化完成后，启动应用：

```bash
# 启动完整应用（前端 + 后端）
npm run dev

# 或分别启动
npm run server  # 后端 (端口 3001)
npm run client  # 前端 (端口 3000)
```

## 🔍 验证安装

1. **检查数据库连接**：
   - 访问 http://localhost:3001/health
   - 应该返回 `{"status":"OK"}`

2. **检查表结构**：
   ```sql
   USE texas_holdem_ai;
   SHOW TABLES;
   ```

3. **检查示例数据**：
   ```sql
   SELECT COUNT(*) FROM games;
   SELECT COUNT(*) FROM players;
   SELECT COUNT(*) FROM behavior_profiles;
   ```

## ❗ 常见问题

### 1. 数据库连接失败
- 检查 MySQL 服务是否运行
- 验证用户名密码是否正确
- 确认端口号是否正确

### 2. 权限错误
```sql
-- 确保用户有创建数据库的权限
GRANT ALL PRIVILEGES ON *.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 字符集问题
```sql
-- 确保数据库使用 UTF-8 字符集
ALTER DATABASE texas_holdem_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 端口冲突
- 检查 3001 端口是否被占用
- 修改 `config.js` 中的端口号

## 📝 开发提示

- 使用 `npm run reset-db` 快速重置数据库
- 使用 `npm run seed-db` 重新添加示例数据
- 开发时建议使用 `alter: true` 模式自动同步表结构变更
- 生产环境请使用 `migrate` 模式管理数据库变更
