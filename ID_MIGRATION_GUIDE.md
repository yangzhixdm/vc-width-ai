# ID字段重构指南

## 概述

本次重构为所有数据库表添加了自增的 `id` 字段来表示添加的先后顺序，同时将原有的UUID `id` 字段重命名为更具描述性的名称。

## 更改详情

### 数据库表结构变更

| 表名 | 原主键 | 新主键 | 新UUID字段 |
|------|--------|--------|------------|
| `games` | `id` (UUID) | `id` (自增INT) | `gameId` (UUID) |
| `players` | `id` (UUID) | `id` (自增INT) | `playerId` (UUID) |
| `actions` | `id` (UUID) | `id` (自增INT) | `actionId` (UUID) |
| `behavior_profiles` | `id` (UUID) | `id` (自增INT) | `behaviorProfileId` (UUID) |

### 外键引用更新

- `players.gameId` → 引用 `games.gameId`
- `actions.gameId` → 引用 `games.gameId`
- `actions.playerId` → 引用 `players.playerId`
- `behavior_profiles.playerId` → 引用 `players.playerId`

## 代码更改

### 模型文件 (server/models/)

所有模型文件都已更新：
- 添加了自增的 `id` 字段作为主键
- 将原有的UUID `id` 字段重命名
- 更新了外键引用

### 服务文件 (server/services/)

- `GameService.js`: 更新了所有数据库查询，使用新的字段名
- `AIService.js`: 更新了玩家ID引用

### 脚本文件 (server/scripts/)

- `seed-db.js`: 更新了示例数据创建逻辑

## 迁移步骤

### 1. 备份数据库

在执行迁移之前，请务必备份您的数据库：

```bash
# MySQL (当前使用的数据库)
mysqldump texas_holdem_ai > backup_before_migration.sql

# PostgreSQL (如果将来需要)
pg_dump your_database > backup_before_migration.sql
```

### 2. 执行迁移

```bash
cd server
npm run migrate-ids
```

### 3. 验证迁移

迁移完成后，请验证：
- 所有表都有自增的 `id` 字段
- UUID字段已正确重命名
- 外键约束正常工作
- 应用程序功能正常

### 4. 回滚（如需要）

如果迁移出现问题，可以使用回滚脚本：

```bash
cd server
npm run rollback-ids
```

## API兼容性

### 服务器端

服务器端在返回数据时保持了API兼容性：
- 返回给客户端的数据中，`id` 字段仍然存在
- 内部使用新的字段名进行数据库操作

### 客户端

客户端代码无需修改，因为：
- API接口保持一致的字段名
- 服务器端负责字段映射

## 优势

1. **顺序性**: 自增ID提供了明确的添加顺序
2. **可读性**: 字段名更具描述性（`gameId`, `playerId`, `actionId`）
3. **性能**: 自增整数主键在查询和索引方面性能更好
4. **兼容性**: 保持了API接口的向后兼容性

## 注意事项

1. **数据迁移**: 现有数据需要迁移到新的结构
2. **外键约束**: 所有外键引用都已更新
3. **索引**: 自增主键会自动创建索引
4. **UUID保留**: 原有的UUID字段仍然保留，用于业务逻辑
5. **MySQL兼容性**: 迁移脚本已针对MySQL数据库进行了优化，使用`CHAR(36)`存储UUID和`AUTO_INCREMENT`创建自增主键
6. **二进制日志安全**: 移除了`DEFAULT (UUID())`以避免MySQL二进制日志复制安全问题

## 故障排除

### 常见问题

1. **外键约束错误**: 确保迁移脚本正确执行
2. **数据丢失**: 检查备份文件
3. **应用程序错误**: 验证模型定义是否正确
4. **MySQL二进制日志错误**: 如果遇到`ER_BINLOG_UNSAFE_SYSTEM_FUNCTION`错误，确保使用最新版本的迁移脚本（已移除`DEFAULT (UUID())`）

### 联系支持

如果遇到问题，请检查：
1. 数据库连接配置
2. 模型定义文件
3. 迁移脚本日志

---

**重要提醒**: 在生产环境执行迁移前，请务必在测试环境验证迁移脚本的正确性。
