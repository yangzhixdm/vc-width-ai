#!/bin/bash

echo "🎯 Texas Hold'em AI Assistant - 快速设置脚本"
echo "=============================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

# 检查 MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL 未安装，请先安装 MySQL 8.0+"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装项目依赖..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 检查配置文件
if [ ! -f "server/config.js" ]; then
    echo "⚙️  创建配置文件..."
    cp server/config.example.js server/config.js
    echo "📝 请编辑 server/config.js 文件，填入你的数据库和 OpenAI API 配置"
    echo "   然后运行: npm run setup-db"
else
    echo "✅ 配置文件已存在"
    
    # 询问是否初始化数据库
    read -p "🗄️  是否现在初始化数据库？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 初始化数据库..."
        npm run setup-db
        
        if [ $? -eq 0 ]; then
            echo "✅ 数据库初始化完成"
            echo "🎉 设置完成！运行 'npm run dev' 启动应用"
        else
            echo "❌ 数据库初始化失败，请检查配置"
        fi
    fi
fi

echo ""
echo "📚 更多信息请查看:"
echo "   - DATABASE_SETUP.md (数据库设置指南)"
echo "   - README.md (完整文档)"
echo ""
echo "🚀 启动命令:"
echo "   npm run dev        # 启动完整应用"
echo "   npm run server     # 仅启动后端"
echo "   npm run client     # 仅启动前端"
