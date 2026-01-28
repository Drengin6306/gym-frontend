# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个健身房管理系统的前端项目,使用 Vue 3 + TypeScript + Vite 构建。系统支持三种角色:会员(member)、教练(coach)和管理员(admin)。

## 常用命令

### 开发环境
```bash
npm install           # 安装依赖
npm run dev          # 启动开发服务器 (默认代理后端 localhost:8080)
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 代码检查和自动修复
npm run format       # Prettier 代码格式化
```

### 生产构建
```bash
npm run build        # 类型检查 + 构建生产版本
npm run build-only   # 仅构建(不检查类型)
npm run preview      # 预览生产构建
```

### Node 版本要求
- Node.js ^20.19.0 || >=22.12.0

## 架构设计

### 路由架构 (src/router/index.ts)
- **公开路由**: `/login` - 登录页面
- **受保护路由**: 所有路由都嵌套在 `MainLayout` 下,需要通过 `localStorage` 中的 `user` 进行身份验证
- **路由守卫**: `beforeEach` 检查 `localStorage.getItem('user')`,未登录用户重定向到 `/login`
- **角色路由分离**:
  - 会员路由: `/dashboard`, `/member/*` (courses, coaches, membership, payments, attendance)
  - 教练路由: `/coach/*` (dashboard, students, schedule, courses)
  - 管理员路由: `/admin/*` (dashboard, members, coaches, programs, card-types, facilities, attendance)

### 状态管理 (Pinia)
**Auth Store** (`src/stores/auth.ts`):
- 使用 Composition API 风格的 `defineStore`
- 状态: `user`, `token`, `role`
- 关键功能:
  - `setAuth(data)`: 登录时设置认证信息,将后端的 `userId` 映射为前端的 `id`
  - `logout()`: 清除认证信息和 localStorage
  - `loadFromStorage()`: 从 localStorage 恢复会话,处理旧数据的 ID 映射问题
- **重要**: 后端返回 `userId`,前端需要映射为 `id` 字段

### API 层 (src/api/)
**请求配置** (`src/api/request.ts`):
- 基于 Axios 创建实例,`baseURL: '/api'`, `timeout: 5000ms`
- **请求拦截器**: 自动从 `localStorage` 获取 token 并添加到 `Authorization` header (`Bearer ${token}`)
- **响应拦截器**: 自动提取 `response.data`,401 错误处理(注释掉的重定向逻辑)
- Vite 开发服务器代理 `/api` 到 `http://localhost:8080`

**API 模块**:
- `auth.ts`: 登录认证
- `membership.ts`: 会员卡管理
- `course.ts`: 课程管理
- `coach.ts`: 教练管理
- `attendance.ts`: 考勤管理
- `payment.ts`: 支付记录

### 类型定义 (src/types/index.ts)
- 核心实体: `Member`, `Coach`, `FitnessProgram`, `MemberCard`, `Venue`, `Equipment`, `Attendance`, `PaymentRecord`
- 认证相关: `LoginRequest`, `LoginResponse`, `User`
- 数据统计: `RevenueTrend`, `MemberStats`, `AttendanceStats`, `PopularCourse`
- **注意**: `LoginResponse` 包含 `userId`,需要在 auth store 中映射为 `id`

### 国际化 (vue-i18n)
- 配置文件: `src/i18n/index.ts`
- 语言文件: `src/locales/zh.json`, `src/locales/en.json`
- 默认语言: 中文 (`zh`), 回退语言: 英语 (`en`)
- 使用 Composition API 模式 (`legacy: false`)

### 视图层组织
- **布局**: `src/layouts/MainLayout.vue` - 包含导航和主内容区域的主布局
- **会员视图**: `src/views/member/` - 会员相关功能页面
- **教练视图**: `src/views/coach/` - 教练工作台相关页面
- **管理员视图**: `src/views/admin/` - 系统管理相关页面
- **共享视图**: `src/views/` - 登录页和通用仪表板

### 技术栈
- **UI 框架**: Vue 3 (Composition API)
- **状态管理**: Pinia 3
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **图表库**: ECharts + vue-echarts
- **样式**: Sass
- **构建工具**: Vite 7
- **类型检查**: TypeScript 5.6, vue-tsc

## 关键开发注意事项

### 认证流程
1. 登录成功后,后端返回包含 `userId` 的响应
2. Auth store 的 `setAuth()` 会将 `userId` 映射为 `id`
3. Token 存储在 `localStorage` 中,并通过请求拦截器自动添加到 API 请求
4. 路由守卫检查 `localStorage.getItem('user')` 来验证身份

### 后端集成
- 开发环境通过 Vite proxy 将 `/api` 请求代理到 `http://localhost:8080`
- 生产环境使用 Nginx 配置(见 `nginx.conf`)
- API 响应自动解包,调用 API 时直接获得 `data` 部分

### 路径别名
- `@/` 映射到 `src/` 目录(配置在 `vite.config.ts`)

### Docker 部署
- `Dockerfile` 和 `nginx.conf` 用于容器化部署
