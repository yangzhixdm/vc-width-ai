# 🚀 开发环境设置指南

## 📋 问题解决方案

### 1. 数据库表结构问题

**问题**：每次启动都执行 `alter` 修改数据库表结构

**解决方案**：
- ✅ 已修改 `server/models/index.js` 中的同步模式
- ✅ 开发环境使用 `sequelize.sync()` 而不是 `sequelize.sync({ alter: true })`
- ✅ 仅在首次初始化时使用强制同步

**配置说明**：
```javascript
// 开发环境 - 仅创建不存在的表
await sequelize.sync();

// 首次初始化 - 强制重新创建所有表
await sequelize.sync({ force: true });
```

### 2. 图标导入问题

**问题**：`Cards` 图标在 lucide-react 中不存在

**解决方案**：
- ✅ 已将 `Cards` 替换为 `CreditCard`
- ✅ 更新了 `HoleCardsSelector.js` 中的图标导入

## ⚙️ 配置文件设置

### 1. 数据库配置

编辑 `server/config.js` 文件：

```javascript
module.exports = {
  database: {
    host: 'localhost',
    port: 3306,
    database: 'texas_holdem_ai',
    username: 'root',
    password: 'your_mysql_password', // 修改为你的MySQL密码
    dialect: 'mysql'
  },
  openai: {
    apiKey: 'your_openai_api_key' // 修改为你的OpenAI API密钥
  },
  server: {
    port: 3001,
    env: 'development'
  }
};
```

### 2. 环境变量（可选）

你也可以使用环境变量：

```bash
# 创建 .env 文件
DB_HOST=localhost
DB_PORT=3306
DB_NAME=texas_holdem_ai
DB_USER=root
DB_PASSWORD=your_password
OPENAI_API_KEY=your_api_key
```

## 🗄️ 数据库管理

### 开发环境命令

```bash
# 首次设置数据库
npm run setup-db

# 重置数据库（删除所有数据）
npm run reset-db

# 仅初始化表结构
npm run init-db

# 添加示例数据
npm run seed-db
```

### 数据库同步模式

- **开发环境**：使用 `sequelize.sync()` - 仅创建不存在的表
- **生产环境**：使用数据库迁移文件管理表结构变更
- **首次初始化**：使用 `sequelize.sync({ force: true })` - 强制重新创建

## 🚀 启动应用

### 1. 配置数据库和API密钥

```bash
# 编辑配置文件
nano server/config.js
```

### 2. 初始化数据库

```bash
# 首次运行
npm run setup-db
```

### 3. 启动应用

```bash
# 启动完整应用
npm run dev

# 或分别启动
npm run server  # 后端
npm run client  # 前端
```

## 🔧 开发提示

### 1. 数据库开发

- **表结构修改**：修改模型文件后，使用 `npm run reset-db` 重置数据库
- **数据保留**：开发时使用 `npm run seed-db` 重新添加示例数据
- **生产部署**：使用数据库迁移文件而不是 `sync()`

### 2. 前端开发

- **图标使用**：检查 lucide-react 文档确认图标名称
- **组件导入**：确保所有导入的组件和图标都存在
- **热重载**：修改文件后自动重新编译

### 3. 调试技巧

- **数据库日志**：开发环境下会显示所有SQL查询
- **API日志**：检查控制台中的API请求和响应
- **错误处理**：查看浏览器控制台和服务器日志

## 📝 常见问题

### Q: 数据库连接失败
A: 检查 `server/config.js` 中的数据库配置，确保MySQL服务运行

### Q: 图标显示错误
A: 检查 lucide-react 文档，使用正确的图标名称

### Q: API请求失败
A: 检查服务器是否启动，端口是否正确

### Q: 前端编译错误
A: 检查导入路径和组件名称是否正确

## 🎯 下一步

1. ✅ 配置数据库连接信息
2. ✅ 设置OpenAI API密钥
3. ✅ 运行 `npm run setup-db` 初始化数据库
4. ✅ 运行 `npm run dev` 启动应用
5. 🎮 开始游戏开发！

现在你的开发环境应该可以正常运行了！🚀
