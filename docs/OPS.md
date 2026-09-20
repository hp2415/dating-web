# dating-web 操作手册

Git：https://github.com/hp2415/dating-web.git（默认分支 `main`）  
本机目录：`d:\Android\dating-web`  
服务器目录：**`/work_place/dating-admin-web`**（Compose 构建上下文用这个名字）  
协作：[AGENTS.md](../AGENTS.md)

## 1. 它做什么

找搭子 **运营后台**，不是用户 App。审核活动 / 举报 / 媒体，看工作台计数。

默认账号（后端种子，生产请改 `.env`）：

- 用户名：`admin`
- 密码：`Admin@123456`

## 2. 本机启动

需要 Node 20+，并先起 `dating-backend`（API `:8000`）。

```powershell
cd d:\Android\dating-web
npm install
$env:VITE_API_PROXY = "http://127.0.0.1:8000"
npm run dev
```

打开 http://localhost:5173 。Vite 把 `/admin` 代理到 `VITE_API_PROXY`。不设该变量时默认 `http://api:8000`（给 Docker Compose 用）。

用 Compose 一起起（在 backend 目录）：

```powershell
cd d:\Android\dating-backend
docker compose up -d --build admin
```

根 `docker-compose.yml` 的 admin `context` 是 `../dating-web`。

## 3. 构建

```powershell
npm run build
```

产物在 `dist/`。`Dockerfile.prod` 把静态文件交给 Nginx；`VITE_API_BASE` 为空，浏览器请求同域 `/admin`、`/api`。

## 4. 服务器发版（git pull）

服务器上本仓应克隆为 **`dating-admin-web`**，与 `dating-backend/deploy/compose.app.yml` 的 `context: ../../dating-admin-web` 一致。

若尚未克隆：

```bash
cd /work_place
git clone https://github.com/hp2415/dating-web.git dating-admin-web
```

日常：

```bash
cd /work_place/dating-admin-web
git pull origin main

cd /work_place/dating-backend
docker compose -p dating-app -f deploy/compose.app.yml --env-file ./.env up -d --build admin
```

网关：公网 `/` → 本镜像 `:8081`；`/admin/` 仍反代到 FastAPI。验收：

```bash
curl -sI http://127.0.0.1:8081/
curl -sI http://127.0.0.1/
```

**不要**再用 scp 覆盖前端；以后只 `git pull`。

后端 API 也更新时，按 [dating-backend/docs/OPS.md](../../dating-backend/docs/OPS.md) 两个仓都 pull，再 `--build` 全栈。

## 5. 和别的仓怎么连

| 后台能力 | 后端 |
|----------|------|
| 登录 / 当前管理员 | `POST /admin/v1/auth/login` · `GET /admin/v1/auth/me` |
| 工作台 | `GET /admin/v1/dashboard/summary` |
| 审核 | `/admin/v1/activities` · `/reports` · `/media` · `/community/posts` |

用户 App 的登录、活动流不走本仓。
