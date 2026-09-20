# Spark Admin Web

React + TypeScript + Ant Design 运营后台。界面壳参考 Skyroc（波浪登录、侧栏、页签、深浅色），业务走 FastAPI `/admin/v1`。

- **操作与发版**：[docs/OPS.md](./docs/OPS.md)
- **Agent 协作**：[AGENTS.md](./AGENTS.md)
- **多仓关系**：[../AGENTS.md](../AGENTS.md)

## 默认账号（后端启动自动种子）

- 用户名：`admin`
- 密码：`Admin@123456`

> 不接短信 SDK；管理员视为已注册。生产环境请改服务器 `.env`。

## 本地启动（需 Node 20+）

```powershell
cd d:\Android\dating-web
npm install
$env:VITE_API_PROXY = "http://127.0.0.1:8000"
npm run dev
```

访问：http://localhost:5173

需同时启动后端 `dating-backend`。Vite 把 `/admin` 代理到 API。

## Docker

在 `dating-backend` 目录：

```powershell
docker compose up -d --build admin
```

服务器发版用 **git pull**（目录名 `dating-admin-web`），见 [docs/OPS.md](./docs/OPS.md)。

## 已实现

- 企微蓝主题 + Skyroc 风格壳（波浪登录、侧栏分组、页签、深浅色）
- 工作台总览与快捷入口
- 内容审核（活动 / 举报 / 媒体 / 历史动态，已接 API）
- 按 iOS 信息架构预留：用户 / 认证 / 信任、活动货架、搭子同好与陪玩、圈子、语音厅、广场、订单钱包凭证会员、安全治理、运营配置
