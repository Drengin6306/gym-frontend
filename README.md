# 健身房管理系统 - 前端

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3-ffd859?style=flat-square&logo=pinia&logoColor=black)
![ECharts](https://img.shields.io/badge/ECharts-6-AA344D?style=flat-square&logo=apache-echarts&logoColor=white)

一个功能完善的健身房管理系统前端应用，支持会员、教练、管理员三种角色，提供会员管理、课程管理、考勤管理、支付管理等完整业务流程。

本项目采用 Vue 3 + TypeScript + Vite 等现代化技术栈构建，采用前后端分离架构，响应式设计支持多种屏幕尺寸。

**项目状态**：学校实验项目，已完成开发。

**后端仓库**：https://github.com/shuijiushikun/gym-club

---

## 🚀 快速开始

### 环境要求

- **Node.js**: `^20.19.0 || >=22.12.0`

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/shuijiushikun/gym-club.git

# 进入前端目录
cd gym-club/gym-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`，自动代理 `/api` 请求到后端 `localhost:8080`。

**注意**：请确保后端服务已启动。

### 其他命令

```bash
npm run build        # 构建生产版本
npm run lint         # 代码检查
npm run type-check   # TypeScript 类型检查
```

---

## 📁 项目结构

### 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **ECharts** - 数据可视化

### 目录结构

```
src/
├── api/          # API 接口层
├── views/        # 页面组件
│   ├── member/   # 会员端页面
│   ├── coach/    # 教练端页面
│   └── admin/    # 管理员端页面
├── stores/       # Pinia 状态管理
├── router/       # 路由配置
├── layouts/      # 布局组件
├── types/        # TypeScript 类型定义
└── locales/      # 国际化语言文件
```

### 路由结构

- **会员路由** (`/member/*`) - 课程浏览、我的课程、教练列表、会员卡管理、考勤记录、支付历史
- **教练路由** (`/coach/*`) - 教练工作台、我的学员、课程管理、课程表
- **管理员路由** (`/admin/*`) - 会员管理、教练管理、课程管理、会员卡类型、场馆设施、考勤管理、支付管理

### 关键文件

- `src/router/index.ts` - 路由配置和导航守卫
- `src/stores/auth.ts` - 认证状态管理
- `src/api/request.ts` - Axios 配置和拦截器
- `src/types/index.ts` - 全局类型定义

---

## 🔌 API 集成说明

### 请求配置

- **API 前缀**：所有 API 请求统一使用 `/api` 前缀
- **请求格式**：JSON

### 开发环境

开发环境下，Vite 开发服务器会自动将 `/api` 请求代理到后端服务器：

```
前端：http://localhost:5173
后端：http://localhost:8080

代理规则：/api/* → http://localhost:8080/api/*
```

代理配置位于 `vite.config.ts`。

### 生产环境

生产环境通过 Nginx 代理 `/api` 请求到后端服务，配置见 `nginx.conf`。

### API 模块

API 接口按功能模块化组织在 `src/api/` 目录：

- `request.ts` - Axios 实例配置和拦截器
- `auth.ts` - 认证相关接口
- `membership.ts` - 会员卡管理
- `course.ts` - 课程管理
- `coach.ts` - 教练管理
- `attendance.ts` - 考勤管理
- `payment.ts` - 支付记录

---

## 🐳 Docker 部署

### 前端镜像构建

项目包含 `Dockerfile`，使用 Nginx 作为 Web 服务器。

构建前端镜像：

```bash
docker build -t gym-frontend .
```

### 联合部署（推荐）

推荐使用 docker-compose 联合部署前后端服务。

docker-compose 配置文件位于后端仓库，详见：
https://github.com/shuijiushikun/gym-club

### Nginx 配置

`nginx.conf` 文件配置了反向代理，将 `/api` 请求转发到后端服务。

如需修改后端地址，编辑 `nginx.conf` 中的 `proxy_pass` 配置：

```nginx
location /api {
    proxy_pass http://backend:8080;  # 修改为实际的后端地址
}
```
