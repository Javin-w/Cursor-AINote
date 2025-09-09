# 智能笔记应用

一个功能完整的笔记和任务管理应用，具有用户身份验证功能。

## 功能特性

### 🔐 用户认证
- **登录/注册**：安全的用户身份验证系统
- **自动登录**：记住用户登录状态，刷新页面不需要重新登录  
- **路由保护**：未登录用户无法访问受保护的页面
- **自动重定向**：登录后自动跳转到之前访问的页面

### 📝 笔记管理
- **创建笔记**：支持富文本笔记内容
- **编辑笔记**：随时修改已有笔记
- **标签系统**：为笔记添加标签，便于分类和搜索
- **搜索功能**：根据标题、内容或标签快速查找笔记
- **标签过滤**：按标签筛选笔记列表

### ✅ 任务管理  
- **任务创建**：创建带有标题、描述、优先级和截止时间的任务
- **状态管理**：支持待处理、进行中、已完成三种状态
- **优先级设置**：高、中、低三个优先级别
- **过期提醒**：自动识别并标记过期任务
- **筛选功能**：按状态和优先级筛选任务

### 🎨 用户界面
- **响应式设计**：支持桌面端和移动端
- **现代化UI**：使用Tailwind CSS构建美观界面
- **实时通知**：操作成功/失败的即时反馈
- **加载状态**：友好的加载提示

## 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **React Router** - 客户端路由
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **React Hot Toast** - 通知组件
- **Vite** - 构建工具

### 架构特点
- **Context + Reducer** - 状态管理
- **Custom Hooks** - 逻辑复用
- **组件化设计** - 可维护的代码结构
- **API抽象层** - 统一的数据请求管理

## 项目结构

```
client/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── LoginForm.tsx   # 登录表单
│   │   ├── Navbar.tsx      # 导航栏
│   │   ├── NoteForm.tsx    # 笔记表单
│   │   ├── NoteCard.tsx    # 笔记卡片
│   │   ├── TaskForm.tsx    # 任务表单
│   │   ├── TaskCard.tsx    # 任务卡片
│   │   ├── ProtectedRoute.tsx # 路由保护
│   │   └── PublicRoute.tsx    # 公共路由
│   ├── context/            # React Context
│   │   └── AuthContext.tsx # 认证上下文
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── LoginPage.tsx   # 登录页面
│   │   ├── Notes.tsx       # 笔记页面
│   │   └── Tasks.tsx       # 任务页面
│   ├── services/           # API服务
│   │   └── api.ts          # API客户端
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts        # 类型声明
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
├── tailwind.config.js      # Tailwind配置
└── vite.config.ts          # Vite配置
```

## 快速开始

### 1. 安装依赖

```bash
cd client
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 3. 构建生产版本

```bash
npm run build
```

## 使用说明

### 登录/注册
1. 首次访问会自动跳转到登录页面
2. 可以选择登录现有账户或注册新账户
3. 注册需要提供用户名、邮箱和密码
4. 登录成功后会跳转到主页

### 笔记管理
1. 点击"笔记"进入笔记管理页面
2. 使用"新建笔记"按钮创建笔记
3. 填写标题、内容，可选添加标签
4. 使用搜索框或标签过滤查找笔记
5. 点击笔记卡片上的编辑/删除按钮管理笔记

### 任务管理
1. 点击"任务"进入任务管理页面
2. 查看任务统计信息（总数、待处理、进行中、已完成）
3. 使用"新建任务"创建任务
4. 设置任务标题、描述、优先级和截止时间
5. 点击任务状态图标快速更改任务状态
6. 使用过滤器按状态和优先级筛选任务

### 导航
- 使用顶部导航栏在不同功能间切换
- 右上角显示当前用户信息和登出按钮
- 移动端支持响应式菜单

## API集成

当前应用使用模拟的API接口，实际使用时需要：

1. 部署后端服务（推荐使用Node.js + Express + MongoDB）
2. 在`src/services/api.ts`中修改`API_BASE_URL`
3. 确保后端API支持以下端点：

### 认证端点
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 用户登出

### 笔记端点
- `GET /api/notes` - 获取笔记列表
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### 任务端点
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

## 开发说明

### 环境要求
- Node.js 16+
- npm 7+

### 开发工具
- VSCode (推荐)
- React Developer Tools
- TypeScript 支持

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 规范
- 组件采用函数式编写
- 使用 ESLint 和 Prettier 格式化代码

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
