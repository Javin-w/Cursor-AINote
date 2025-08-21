# 认证系统设计文档

## 概述

AI笔记应用实现了完整的用户认证系统，确保用户数据的安全性和隐私性。每个用户只能访问和管理自己的笔记和任务数据。

## 认证流程

### 1. 用户注册
- 用户提供用户名、邮箱和密码
- 后端验证数据有效性和唯一性
- 使用 bcryptjs 对密码进行安全哈希处理（12轮加盐）
- 生成 JWT 令牌并返回用户信息

### 2. 用户登录
- 用户提供邮箱和密码
- 后端验证用户身份
- 比较密码哈希值
- 生成新的 JWT 令牌

### 3. 令牌认证
- 所有受保护的API都需要 JWT 令牌
- 令牌通过 Authorization 头传递：`Bearer <token>`
- 令牌有效期为7天
- 支持令牌刷新机制

## 安全特性

### 后端安全
- **密码哈希**: 使用 bcryptjs 进行12轮加盐哈希
- **JWT安全**: 使用环境变量配置的密钥签名
- **速率限制**: 
  - 登录接口：15分钟内最多5次尝试
  - 注册接口：1小时内最多3次注册
- **数据验证**: 严格的输入验证和类型检查
- **数据隔离**: 用户只能访问自己的数据

### 前端安全
- **令牌存储**: 使用 localStorage 安全存储
- **自动认证**: Axios 拦截器自动添加认证头
- **路由保护**: 未认证用户自动重定向到登录页
- **状态管理**: React Context 管理认证状态
- **安全退出**: 清除本地存储的令牌和用户信息

## API 接口

### 认证接口

#### 注册用户
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名（至少3个字符）",
  "email": "有效的邮箱地址",
  "password": "密码（至少6个字符）"
}
```

**响应示例**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "用户名",
    "email": "邮箱地址"
  }
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "邮箱地址",
  "password": "密码"
}
```

#### 获取用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 刷新令牌
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID
  username TEXT UNIQUE NOT NULL,    -- 用户名
  email TEXT UNIQUE NOT NULL,       -- 邮箱
  password_hash TEXT NOT NULL,      -- 密码哈希
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 数据关联
- 笔记表和任务表都添加了 `user_id` 字段
- 使用外键约束确保数据完整性
- 用户删除时级联删除相关数据

## 前端实现

### 认证上下文 (AuthContext)
- 管理全局认证状态
- 提供登录、注册、退出方法
- 自动检查令牌有效性
- 处理认证状态变化

### 路由保护 (ProtectedRoute)
- 检查用户认证状态
- 未认证用户重定向到登录页
- 保存用户原始访问路径
- 显示加载状态

### 登录/注册页面
- 响应式设计，适配移动端
- 表单验证和错误处理
- 密码显示/隐藏切换
- 美观的UI设计

## 最佳实践

### 安全建议
1. **生产环境**:
   - 使用强随机密钥作为 JWT_SECRET
   - 启用 HTTPS
   - 配置适当的 CORS 策略

2. **令牌管理**:
   - 定期刷新令牌
   - 实现令牌黑名单（可选）
   - 考虑使用 httpOnly cookies（高级）

3. **密码策略**:
   - 要求复杂密码
   - 实现密码重置功能
   - 考虑双因素认证

### 开发建议
1. **错误处理**: 统一的错误响应格式
2. **日志记录**: 记录认证相关的操作
3. **测试**: 编写认证流程的自动化测试
4. **监控**: 监控异常登录行为

## 演示账户

开发和测试时可使用以下演示账户：

```
邮箱: demo@example.com
密码: 123456
```

运行 `./demo-data.sh` 脚本会自动创建此账户和相关演示数据。

## 技术栈

- **后端**: Node.js + Express + JWT + bcryptjs
- **前端**: React + Context API + Axios + React Router
- **数据库**: SQLite 
- **安全**: CORS + Helmet + Rate Limiting