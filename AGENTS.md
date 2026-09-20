# dating-web · Agent

Spark 运营后台（React 18 + Vite + Ant Design 5）。视觉参考 Skyroc 的壳（登录波浪、侧栏、页签、深浅色），**不要**把 Skyroc monorepo 整仓拷进来，也不要改成 Vue。

## 边界

- 只调 `/admin/v1/*`。不要直接打 `/api/v1`（那是 App 用的）。
- 请求走 `src/api/` + `src/api/client.ts` 信封 `{ code, message, data }`。
- 鉴权：`src/auth/session.ts`（localStorage token）。401 回登录页。
- 生产构建 `VITE_API_BASE` 为空：与 Nginx 同源，`/admin` 由网关反代到 API。

## 页面

| 路由 | 状态 |
|------|------|
| `/login` | 已接登录 |
| `/` | 工作台 summary + 快捷入口 |
| `/moderation` | 活动 / 举报 / 媒体 / 历史动态（Live） |
| 用户 / 活动 / 搭子 / 广场 / 商业 / 安全 / 配置 | 预览占位，对齐 iOS IA，样例表 + 待接 API |

菜单树在 `src/layouts/menu.ts`。主题色为企微蓝 `#267EF0`。新菜单加 leaf + `PREVIEW_SPECS`，并在 `App.tsx` 由树自动注册预览路由。

## 和后端

改审核、仪表盘、用户管理时，先确认 `dating-backend` 已有对应 `/admin/v1` 路由。不要为了页面假造成功响应。

服务器目录名是 `dating-admin-web`，发版见 [docs/OPS.md](./docs/OPS.md)。
