#!/bin/bash

echo "🚀 开始设置 AI笔记应用..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js 18 或更高版本"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本需要 18 或更高版本，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node -v)"

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 安装服务端依赖
echo "📦 安装服务端依赖..."
cd server
npm install
cd ..

# 安装客户端依赖
echo "📦 安装客户端依赖..."
cd client
npm install
cd ..

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p server/data

echo "✅ 设置完成！"
echo ""
echo "🎉 现在您可以运行以下命令启动应用:"
echo ""
echo "  开发模式 (推荐):"
echo "    npm run dev"
echo ""
echo "  分别启动前后端:"
echo "    npm run dev:server  # 后端服务 (http://localhost:3001)"
echo "    npm run dev:client  # 前端服务 (http://localhost:3000)"
echo ""
echo "  生产构建:"
echo "    npm run build"
echo "    npm start"
echo ""
echo "📖 更多信息请查看 README.md"