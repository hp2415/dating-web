# Spark Admin Web

React + TypeScript + Ant Design 运营后台骨架。

## 默认账号（后端启动自动种子）

- 用户名：`admin`
- 密码：`Admin@123456`

> 不接短信 SDK；管理员视为已注册，使用账号密码登录。

## 本地启动（需 Node 20+）

```bash
cd dating-admin-web
npm install
npm run dev
```

访问：http://localhost:5173

需同时启动后端 `dating-backend`（默认 API `http://localhost:8000`）。

开发代理：Vite 把 `/admin` 代理到 API。

## Docker（推荐）

在 `dating-backend` 目录：

```bash
docker compose up -d --build admin
```

访问：http://localhost:5173

## 已实现

- 登录页 / 鉴权会话
- 侧栏布局（工作台、用户、审核、设置占位）
- 调用 `/admin/v1/auth/login`、`/auth/me`、`/dashboard/summary`
