# dating-web · Agent

Spark 运营后台（React 18 + Vite + Ant Design 5）。视觉参考 Skyroc 的壳（登录波浪、侧栏、页签、深浅色），**不要**把 Skyroc monorepo 整仓拷进来，也不要改成 Vue。

## 边界

- 只调 `/admin/v1/*`。不要直接打 `/api/v1`（那是 App 用的）。
- 请求走 `src/api/` + `src/api/client.ts` / `http.ts` 信封 `{ code, message, data }`。
- 鉴权：`src/auth/session.ts`（localStorage token + permissions）。登录后拉 `/admin/v1/auth/me`。401 回登录页。
- 写操作用 `<Can perm="...">` 隐藏；`*` 或角色 `superadmin` 放行。
- 生产构建 `VITE_API_BASE` 为空：与 Nginx 同源，`/admin` 由网关反代到 API。

## 页面（Live = 已接 API）

| 路由 | 状态 |
|------|------|
| `/login` · `/` · `/moderation` | Live |
| `/orders` · `/wallet` | Live（订单 / 退款 / 流水 / 对账） |
| `/buddies/paid` · `/buddies/free` | Live（陪玩审核 · 同好意图） |
| `/users/trust` · `/users/verification` | Live（信任分 · 真人认证） |
| `/safety/reports` · `/safety/blocks` · `/safety/sensitive-words` | Live |
| `/activities` · `/activities/shelves` · `/community` | Live |
| `/config/taxonomy` · `/config/push` · `/config/announcements` | Live |
| `/conversations` | Live（会话 / 好友 / 打招呼 / 转账 / 通话） |
| `/users` · 圈子 · 语音厅 · 凭证 · 会员 · 短信 · 设置 | 预览占位（后端尚无对应 admin 列表） |

菜单树在 `src/layouts/menu.ts`（`status: live | preview`）。新 Live 页：加 leaf + `App.tsx` 路由 + `api/*`；预览页只加 leaf + `PREVIEW_SPECS`。

## 和后端

改审核、仪表盘、用户管理时，先确认 `dating-backend` 已有对应 `/admin/v1` 路由。不要为了页面假造成功响应。用户列表等仍缺 API 的保持预览。

服务器目录名是 `dating-admin-web`，发版见 [docs/OPS.md](./docs/OPS.md)。
