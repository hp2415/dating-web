# Spark Admin Web

React + TypeScript + Ant Design 运营后台。界面壳参考 [Skyroc Admin](https://admin.skyroc.me/)：波浪登录页、侧栏布局、Chrome 页签、浅色/深色主题。业务接口仍走本仓库 FastAPI。

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

- Skyroc 风格登录页 / 鉴权会话 / 深浅色切换
- 侧栏、面包屑、Chrome 页签、工作台指标卡
- 内容审核（活动 / 举报 / 媒体 / 历史动态）
- 调用 `/admin/v1/auth/login`、`/auth/me`、`/dashboard/summary`
