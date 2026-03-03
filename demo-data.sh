#!/bin/bash

echo "📝 正在创建演示数据..."

# 等待服务器启动
sleep 3

# 注册演示用户
echo "👤 正在注册演示用户..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "email": "demo@example.com",
    "password": "123456"
  }')

# 提取token
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 用户注册失败，可能用户已存在"
  
  # 尝试登录
  echo "🔑 尝试登录现有用户..."
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "demo@example.com",
      "password": "123456"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败，请检查服务器状态"
    exit 1
  fi
fi

echo "✅ 用户认证成功"

# 创建演示笔记
echo "📝 创建演示笔记..."
curl -s -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "欢迎使用AI笔记",
    "content": "这是您的第一篇笔记！\n\n您可以在这里记录想法、灵感、学习笔记等。\n\n功能特点：\n- 支持富文本编辑\n- 标签分类管理\n- 全文搜索\n- 响应式设计\n- 用户认证保护",
    "tags": ["欢迎", "入门指南"]
  }' > /dev/null

curl -s -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "工作计划",
    "content": "本周工作安排：\n\n1. 完成项目文档编写\n2. 准备下周的会议材料\n3. 代码审查和优化\n4. 团队沟通协调",
    "tags": ["工作", "计划"]
  }' > /dev/null

curl -s -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "学习笔记 - React Hooks",
    "content": "今天学习了React Hooks的使用方法：\n\nuseState: 管理组件状态\nuseEffect: 处理副作用\nuseContext: 共享数据\nuseReducer: 复杂状态管理\n\nHooks让函数组件具备了类组件的功能，代码更简洁优雅。",
    "tags": ["学习", "React", "前端"]
  }' > /dev/null

# 创建演示任务
echo "✅ 创建演示任务..."
curl -s -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "完成项目文档",
    "description": "编写项目的技术文档和用户手册",
    "priority": "high",
    "due_date": "'$(date -d "+3 days" -Iseconds)'"
  }' > /dev/null

curl -s -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "代码重构",
    "description": "优化核心模块的代码结构和性能",
    "priority": "medium",
    "due_date": "'$(date -d "+1 week" -Iseconds)'"
  }' > /dev/null

curl -s -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "学习新技术",
    "description": "研究最新的前端开发技术和工具",
    "priority": "low"
  }' > /dev/null

echo "✅ 演示数据创建完成！"
echo ""
echo "🎉 演示用户信息："
echo "   邮箱: demo@example.com"
echo "   密码: 123456"
echo ""
echo "🌐 请打开浏览器访问: http://localhost:3000"
echo "   使用上述账户信息登录体验完整功能"