#!/bin/bash

echo "🚀 启动 AI笔记应用 (生产模式)..."

# 检查是否已构建
if [ ! -d "server/dist" ] || [ ! -d "client/dist" ]; then
    echo "📦 正在构建应用..."
    npm run build
fi

echo "🎯 启动生产服务器..."
npm start