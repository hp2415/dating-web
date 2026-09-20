import type { ComponentType, ReactNode } from "react";
import {
  AuditOutlined,
  BankOutlined,
  CalendarOutlined,
  ClusterOutlined,
  DashboardOutlined,
  IdcardOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  SoundOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
  AlertOutlined,
  AppstoreOutlined,
  UserSwitchOutlined,
  TagsOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";

export type AppMenuLeaf = {
  key: string;
  path: string;
  title: string;
  icon: ComponentType;
  closable: boolean;
  group?: string;
  /** 预览页说明，对齐 iOS 能力 */
  blurb?: string;
  /** 相对后端能力状态 */
  status?: "live" | "preview";
};

export type AppMenuGroup = {
  key: string;
  title: string;
  icon: ComponentType;
  children: AppMenuLeaf[];
};

export type AppMenuNode = AppMenuLeaf | AppMenuGroup;

function isGroup(node: AppMenuNode): node is AppMenuGroup {
  return "children" in node;
}

/** 对齐 iOS 五 Tab + 横切运营能力 */
export const APP_MENU_TREE: AppMenuNode[] = [
  {
    key: "dashboard",
    path: "/",
    title: "工作台",
    icon: DashboardOutlined,
    closable: false,
    status: "live",
    blurb: "运营总览与待办入口",
  },
  {
    key: "users-group",
    title: "用户中心",
    icon: TeamOutlined,
    children: [
      {
        key: "users",
        path: "/users",
        title: "用户列表",
        icon: TeamOutlined,
        closable: true,
        status: "preview",
        blurb: "账号、资料完善度、城市与兴趣；对应 App「我的」身份行。",
      },
      {
        key: "users-verification",
        path: "/users/verification",
        title: "真人认证",
        icon: IdcardOutlined,
        closable: true,
        status: "live",
        blurb: "人脸 / 实名认证队列，对齐信任模型里的认证推进。",
      },
      {
        key: "users-trust",
        path: "/users/trust",
        title: "信任档案",
        icon: SafetyCertificateOutlined,
        closable: true,
        status: "live",
        blurb: "四轴信用与公开凭证预览，对应 TrustBehaviorModel。",
      },
    ],
  },
  {
    key: "activities-group",
    title: "活动运营",
    icon: CalendarOutlined,
    children: [
      {
        key: "activities",
        path: "/activities",
        title: "活动列表",
        icon: CalendarOutlined,
        closable: true,
        status: "live",
        blurb: "场：发现货架、主办改期、名额与候补；审核见「内容审核」。",
      },
      {
        key: "activities-shelves",
        path: "/activities/shelves",
        title: "发现货架",
        icon: AppstoreOutlined,
        closable: true,
        status: "live",
        blurb: "猜你喜欢 / Hero / 分区轨配置，对齐活动 Tab App Store 节奏。",
      },
    ],
  },
  {
    key: "buddies-group",
    title: "搭子运营",
    icon: UserSwitchOutlined,
    children: [
      {
        key: "buddies-free",
        path: "/buddies/free",
        title: "同好（免费）",
        icon: TeamOutlined,
        closable: true,
        status: "live",
        blurb: "找人玩 · 免费路径：打招呼、邀约去某场。",
      },
      {
        key: "buddies-paid",
        path: "/buddies/paid",
        title: "陪玩（预约）",
        icon: ShopOutlined,
        closable: true,
        status: "live",
        blurb: "找人玩 · 预约路径：档期、定价、排行榜与服务者治理。",
      },
      {
        key: "circles",
        path: "/circles",
        title: "兴趣圈子",
        icon: ClusterOutlined,
        closable: true,
        status: "preview",
        blurb: "圈子信息、成员与加入审核。",
      },
      {
        key: "voice-rooms",
        path: "/voice-rooms",
        title: "语音厅",
        icon: SoundOutlined,
        closable: true,
        status: "preview",
        blurb: "语音派对厅列表与违规处置预留。",
      },
    ],
  },
  {
    key: "community-group",
    title: "广场内容",
    icon: TrophyOutlined,
    children: [
      {
        key: "community",
        path: "/community",
        title: "动态管理",
        icon: TrophyOutlined,
        closable: true,
        status: "live",
        blurb: "活动种草 / 复盘流；待审也可在「内容审核 · 历史动态」。",
      },
    ],
  },
  {
    key: "moderation",
    path: "/moderation",
    title: "内容审核",
    icon: AuditOutlined,
    closable: true,
    status: "live",
    blurb: "活动 / 举报 / 媒体 / 历史动态（已接 /admin/v1）。",
  },
  {
    key: "commerce-group",
    title: "商业履约",
    icon: WalletOutlined,
    children: [
      {
        key: "orders",
        path: "/orders",
        title: "订单中心",
        icon: BankOutlined,
        closable: true,
        status: "live",
        blurb: "活动参加订单 + 陪玩预约订单、退款入口。",
      },
      {
        key: "wallet",
        path: "/wallet",
        title: "钱包与退款",
        icon: WalletOutlined,
        closable: true,
        status: "live",
        blurb: "演示支付流水、退款策略与异常单。",
      },
      {
        key: "credentials",
        path: "/credentials",
        title: "履约凭证",
        icon: FileProtectOutlined,
        closable: true,
        status: "preview",
        blurb: "活动票面 / 预约凭证夹，对齐 PassKit 体验。",
      },
      {
        key: "membership",
        path: "/membership",
        title: "会员",
        icon: TrophyOutlined,
        closable: true,
        status: "preview",
        blurb: "会员套餐与开通记录预留。",
      },
    ],
  },
  {
    key: "messaging-group",
    title: "消息关系",
    icon: SoundOutlined,
    children: [
      {
        key: "conversations",
        path: "/conversations",
        title: "消息关系",
        icon: SoundOutlined,
        closable: true,
        status: "live",
        blurb: "会话 / 好友 / 打招呼 / 转账 / 通话只读；消息体在云 IM。",
      },
    ],
  },
  {
    key: "safety-group",
    title: "安全治理",
    icon: AlertOutlined,
    children: [
      {
        key: "safety-reports",
        path: "/safety/reports",
        title: "举报处置",
        icon: AlertOutlined,
        closable: true,
        status: "live",
        blurb: "用户举报工单；与「内容审核 · 举报工单」同源。",
      },
      {
        key: "safety-blocks",
        path: "/safety/blocks",
        title: "拉黑与限流",
        icon: SafetyCertificateOutlined,
        closable: true,
        status: "live",
        blurb: "封禁、限流制裁；已接 /admin/v1/sanctions。",
      },
      {
        key: "safety-sensitive",
        path: "/safety/sensitive-words",
        title: "敏感词",
        icon: FileProtectOutlined,
        closable: true,
        status: "live",
        blurb: "敏感词库维护；命中动作 warn / block。",
      },
    ],
  },
  {
    key: "config-group",
    title: "运营配置",
    icon: TagsOutlined,
    children: [
      {
        key: "config-taxonomy",
        path: "/config/taxonomy",
        title: "城市与兴趣",
        icon: TagsOutlined,
        closable: true,
        status: "live",
        blurb: "开放域兴趣 / 城市字典，避免写死少数场景磁贴。",
      },
      {
        key: "config-push",
        path: "/config/push",
        title: "通知推送",
        icon: NotificationOutlined,
        closable: true,
        status: "live",
        blurb: "推送任务 stub：发送写入站内信。",
      },
      {
        key: "config-announcements",
        path: "/config/announcements",
        title: "公告与反馈",
        icon: NotificationOutlined,
        closable: true,
        status: "live",
        blurb: "公告发布 + 意见反馈工单。",
      },
      {
        key: "config-sms",
        path: "/config/sms",
        title: "短信通道",
        icon: NotificationOutlined,
        closable: true,
        status: "preview",
        blurb: "登录验证码通道与日限额（开发码 123456）。",
      },
    ],
  },
  {
    key: "settings",
    path: "/settings",
    title: "系统设置",
    icon: SettingOutlined,
    closable: true,
    status: "preview",
    blurb: "管理员账号、角色权限与审计日志预留。",
  },
];

export const APP_MENUS: AppMenuLeaf[] = APP_MENU_TREE.flatMap((node) =>
  isGroup(node) ? node.children : [node],
);

export function menuByPath(pathname: string): AppMenuLeaf {
  const exact = APP_MENUS.find((item) => item.path === pathname);
  if (exact) return exact;
  const ranked = [...APP_MENUS]
    .filter((item) => item.path !== "/" && pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length);
  return ranked[0] || APP_MENUS[0];
}

export function openKeysForPath(pathname: string): string[] {
  const current = menuByPath(pathname);
  for (const node of APP_MENU_TREE) {
    if (isGroup(node) && node.children.some((c) => c.key === current.key)) {
      return [node.key];
    }
  }
  return [];
}

export type PreviewColumn = { title: string; dataIndex: string; width?: number };
export type PreviewRow = Record<string, ReactNode>;

export type PreviewSpec = {
  title: string;
  blurb: string;
  status: "live" | "preview";
  iosRef: string;
  metrics?: Array<{ label: string; value: string | number; tip?: string }>;
  columns: PreviewColumn[];
  rows: PreviewRow[];
  nextApis?: string[];
};

export const PREVIEW_SPECS: Record<string, PreviewSpec> = {
  users: {
    title: "用户列表",
    blurb: "账号、资料完善度、城市与兴趣；对应 App「我的」身份行。",
    status: "preview",
    iosRef: "Features/Profile · 身份行 / Onboarding",
    metrics: [
      { label: "注册用户", value: "—" },
      { label: "今日新增", value: "—" },
      { label: "资料完善率", value: "—" },
    ],
    columns: [
      { title: "昵称", dataIndex: "name" },
      { title: "城市", dataIndex: "city" },
      { title: "完善度", dataIndex: "completion" },
      { title: "状态", dataIndex: "status" },
      { title: "最近活跃", dataIndex: "active" },
    ],
    rows: [
      { name: "林夏", city: "上海", completion: "92%", status: "正常", active: "2 分钟前" },
      { name: "周然", city: "杭州", completion: "78%", status: "正常", active: "1 小时前" },
      { name: "何安", city: "深圳", completion: "65%", status: "限流", active: "昨天" },
    ],
    nextApis: ["GET /admin/v1/users", "GET /admin/v1/users/{id}"],
  },
  "users-verification": {
    title: "真人认证",
    blurb: "人脸 / 实名认证队列，对齐信任模型里的认证推进。",
    status: "live",
    iosRef: "Features/Trust · 去认证",
    metrics: [
      { label: "待审", value: 3 },
      { label: "今日通过", value: 12 },
      { label: "驳回", value: 1 },
    ],
    columns: [
      { title: "用户", dataIndex: "name" },
      { title: "类型", dataIndex: "type" },
      { title: "提交时间", dataIndex: "time" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { name: "阿哲", type: "真人拍照", time: "今天 09:12", status: "待审" },
      { name: "Momo", type: "实名", time: "昨天 21:40", status: "待审" },
    ],
    nextApis: ["GET /admin/v1/verifications", "POST /admin/v1/verifications/{id}/review"],
  },
  "users-trust": {
    title: "信任档案",
    blurb: "四轴信用与公开凭证预览，对应 TrustBehaviorModel。",
    status: "live",
    iosRef: "Docs/TrustBehaviorModel · TrustPublicPreviewView",
    metrics: [
      { label: "Safety 偏低", value: 4 },
      { label: "履约优秀", value: 28 },
      { label: "认证徽章", value: 56 },
    ],
    columns: [
      { title: "用户", dataIndex: "name" },
      { title: "Safety", dataIndex: "safety" },
      { title: "履约", dataIndex: "fulfill" },
      { title: "贡献", dataIndex: "contrib" },
      { title: "公开徽章", dataIndex: "badge" },
    ],
    rows: [
      { name: "林夏", safety: "高", fulfill: "高", contrib: "中", badge: "真人 · 准时达人" },
      { name: "何安", safety: "中", fulfill: "中", contrib: "低", badge: "新人" },
    ],
    nextApis: ["GET /admin/v1/trust/scores", "GET /admin/v1/trust/events"],
  },
  activities: {
    title: "活动列表",
    blurb: "场：发现货架、主办改期、名额与候补。",
    status: "live",
    iosRef: "Features/Activities · 发现 / 详情 / 主办",
    metrics: [
      { label: "进行中", value: "—" },
      { label: "待审", value: "见审核" },
      { label: "今日报名", value: "—" },
    ],
    columns: [
      { title: "标题", dataIndex: "title" },
      { title: "城市", dataIndex: "city" },
      { title: "分类", dataIndex: "category" },
      { title: "名额", dataIndex: "cap" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { title: "夜骑滨江", city: "杭州", category: "运动", cap: "6/12", status: "已发布" },
      { title: "周末市集探店", city: "上海", category: "线下", cap: "3/8", status: "待审" },
    ],
    nextApis: ["GET /admin/v1/activities"],
  },
  "activities-shelves": {
    title: "发现货架",
    blurb: "猜你喜欢 / Hero / 分区轨配置。",
    status: "live",
    iosRef: "ActivitiesView · App Store Today 货架",
    metrics: [
      { label: "Hero 位", value: 1 },
      { label: "分区轨", value: 4 },
      { label: "置顶活动", value: 0 },
    ],
    columns: [
      { title: "货架", dataIndex: "shelf" },
      { title: "策略", dataIndex: "strategy" },
      { title: "城市", dataIndex: "city" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { shelf: "猜你喜欢", strategy: "兴趣 + 附近", city: "全国", status: "草稿" },
      { shelf: "周末精选 Hero", strategy: "人工精选", city: "上海", status: "草稿" },
    ],
    nextApis: ["GET/PUT /admin/v1/discover-shelves"],
  },
  "buddies-free": {
    title: "同好（免费）",
    blurb: "找人玩 · 免费路径：打招呼、邀约去某场。",
    status: "live",
    iosRef: "BuddiesProductPlan · 免费分段",
    metrics: [
      { label: "在线意图", value: 18 },
      { label: "今日打招呼", value: 42 },
      { label: "邀约转化", value: "8%" },
    ],
    columns: [
      { title: "用户", dataIndex: "name" },
      { title: "我想…", dataIndex: "intent" },
      { title: "距离", dataIndex: "dist" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { name: "阿哲", intent: "今晚打球", dist: "1.2km", status: "刚活跃" },
      { name: "小满", intent: "周末徒步", dist: "3.4km", status: "推荐" },
    ],
    nextApis: ["GET /admin/v1/buddy-intents"],
  },
  "buddies-paid": {
    title: "陪玩（预约）",
    blurb: "档期、定价、排行榜与服务者治理。",
    status: "live",
    iosRef: "BuddiesProductPlan · 预约分段",
    metrics: [
      { label: "在架服务者", value: 26 },
      { label: "今日订单", value: "—" },
      { label: "待履约", value: "—" },
    ],
    columns: [
      { title: "昵称", dataIndex: "name" },
      { title: "擅长", dataIndex: "skill" },
      { title: "价格", dataIndex: "price" },
      { title: "认证", dataIndex: "cert" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { name: "教练阿凯", skill: "篮球 · 线下", price: "¥128/时", cert: "已认证", status: "可约" },
      { name: "语音陪聊 Mira", skill: "聊天", price: "¥38/时", cert: "审核中", status: "下架" },
    ],
    nextApis: ["GET /admin/v1/companions", "POST /admin/v1/companions/{id}/review"],
  },
  circles: {
    title: "兴趣圈子",
    blurb: "圈子信息、成员与加入审核。",
    status: "preview",
    iosRef: "Buddies · CircleBrowseRoute",
    metrics: [
      { label: "圈子数", value: 12 },
      { label: "待审加入", value: 5 },
    ],
    columns: [
      { title: "圈子", dataIndex: "name" },
      { title: "成员", dataIndex: "members" },
      { title: "城市", dataIndex: "city" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { name: "夜跑小队", members: 86, city: "杭州", status: "正常" },
      { name: "咖啡探店", members: 120, city: "上海", status: "正常" },
    ],
    nextApis: ["GET /admin/v1/circles"],
  },
  "voice-rooms": {
    title: "语音厅",
    blurb: "语音派对厅列表与违规处置预留。",
    status: "preview",
    iosRef: "Buddies · 语音厅入口",
    metrics: [
      { label: "进行中", value: 3 },
      { label: "今日峰值在线", value: 64 },
    ],
    columns: [
      { title: "厅名", dataIndex: "name" },
      { title: "主题", dataIndex: "topic" },
      { title: "在线", dataIndex: "online" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { name: "深夜电台", topic: "闲聊", online: 18, status: "直播中" },
      { name: "周末组局", topic: "活动招募", online: 9, status: "直播中" },
    ],
    nextApis: ["GET /admin/v1/voice-rooms", "强制关厅"],
  },
  community: {
    title: "动态管理",
    blurb: "活动种草 / 复盘流；待审走内容审核。",
    status: "live",
    iosRef: "Features/Community",
    metrics: [
      { label: "已发布", value: "—" },
      { label: "待审", value: "见审核" },
    ],
    columns: [
      { title: "作者", dataIndex: "author" },
      { title: "摘要", dataIndex: "summary" },
      { title: "关联活动", dataIndex: "activity" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { author: "林夏", summary: "滨江夜骑复盘…", activity: "夜骑滨江", status: "已发布" },
      { author: "周然", summary: "市集打卡", activity: "—", status: "待审" },
    ],
    nextApis: ["GET /admin/v1/community/posts"],
  },
  orders: {
    title: "订单中心",
    blurb: "活动参加订单 + 陪玩预约订单。",
    status: "live",
    iosRef: "Profile · 订单列表",
    metrics: [
      { label: "今日成交", value: "¥—" },
      { label: "待履约", value: "—" },
      { label: "退款中", value: "—" },
    ],
    columns: [
      { title: "订单号", dataIndex: "id" },
      { title: "类型", dataIndex: "type" },
      { title: "用户", dataIndex: "user" },
      { title: "金额", dataIndex: "amount" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { id: "A20260320001", type: "活动", user: "林夏", amount: "¥49", status: "已支付" },
      { id: "B20260320008", type: "陪玩", user: "阿哲", amount: "¥128", status: "待履约" },
    ],
    nextApis: ["GET /admin/v1/orders"],
  },
  wallet: {
    title: "钱包与退款",
    blurb: "演示支付流水、退款策略与异常单。",
    status: "live",
    iosRef: "WalletStore · RefundFlow",
    metrics: [
      { label: "退款申请", value: 2 },
      { label: "异常支付", value: 0 },
    ],
    columns: [
      { title: "流水", dataIndex: "id" },
      { title: "用户", dataIndex: "user" },
      { title: "方向", dataIndex: "dir" },
      { title: "金额", dataIndex: "amount" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { id: "W9001", user: "何安", dir: "退款", amount: "¥49", status: "处理中" },
      { id: "W9002", user: "林夏", dir: "支付", amount: "¥128", status: "成功" },
    ],
    nextApis: ["GET /admin/v1/wallet/ledger", "POST /admin/v1/refunds/{id}/process"],
  },
  credentials: {
    title: "履约凭证",
    blurb: "活动票面 / 预约凭证夹。",
    status: "preview",
    iosRef: "PassKit · 凭证夹 / Wallet",
    metrics: [
      { label: "有效凭证", value: "—" },
      { label: "今日核销", value: "—" },
    ],
    columns: [
      { title: "凭证", dataIndex: "title" },
      { title: "持有人", dataIndex: "user" },
      { title: "类型", dataIndex: "type" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { title: "夜骑滨江 · 入场", user: "林夏", type: "活动", status: "待使用" },
      { title: "篮球陪练 60min", user: "阿哲", type: "预约", status: "已履约" },
    ],
    nextApis: ["GET /admin/v1/credentials"],
  },
  membership: {
    title: "会员",
    blurb: "会员套餐与开通记录预留。",
    status: "preview",
    iosRef: "Profile · 开通会员",
    metrics: [
      { label: "有效会员", value: "—" },
      { label: "今日开通", value: "—" },
    ],
    columns: [
      { title: "用户", dataIndex: "user" },
      { title: "套餐", dataIndex: "plan" },
      { title: "到期", dataIndex: "expire" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { user: "周然", plan: "月度", expire: "2026-04-20", status: "有效" },
    ],
    nextApis: ["GET /admin/v1/memberships"],
  },
  "safety-reports": {
    title: "举报处置",
    blurb: "用户举报工单；与内容审核同源。",
    status: "live",
    iosRef: "举报 Sheet · TrustSafetyCheckIn",
    metrics: [
      { label: "待处理", value: "见审核" },
      { label: "今日处置", value: "—" },
    ],
    columns: [
      { title: "举报人", dataIndex: "from" },
      { title: "对象", dataIndex: "to" },
      { title: "原因", dataIndex: "reason" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { from: "用户A", to: "用户B", reason: "骚扰", status: "待处理" },
    ],
    nextApis: ["GET /admin/v1/reports"],
  },
  conversations: {
    title: "消息关系",
    blurb: "会话 / 好友 / 打招呼 / 转账 / 通话只读。",
    status: "live",
    iosRef: "消息 Tab",
    columns: [
      { title: "标题", dataIndex: "title" },
      { title: "类型", dataIndex: "kind" },
      { title: "成员", dataIndex: "members" },
    ],
    rows: [],
    nextApis: [
      "GET /admin/v1/conversations",
      "GET /admin/v1/friendships",
      "GET /admin/v1/message-requests",
      "GET /admin/v1/transfers",
      "GET /admin/v1/calls",
    ],
  },
  "safety-blocks": {
    title: "拉黑与限流",
    blurb: "封禁、限流制裁；已接 /admin/v1/sanctions。",
    status: "live",
    iosRef: "blocks API · Trust Safety 轴",
    metrics: [
      { label: "封禁中", value: "—" },
      { label: "限流中", value: "—" },
    ],
    columns: [
      { title: "用户", dataIndex: "user" },
      { title: "措施", dataIndex: "action" },
      { title: "原因", dataIndex: "reason" },
      { title: "截止", dataIndex: "until" },
    ],
    rows: [
      { user: "spam_01", action: "封禁", reason: "批量导流", until: "永久" },
    ],
    nextApis: ["GET /admin/v1/sanctions"],
  },
  "safety-sensitive": {
    title: "敏感词",
    blurb: "敏感词库维护。",
    status: "live",
    iosRef: "内容安全横切",
    columns: [
      { title: "词", dataIndex: "word" },
      { title: "分类", dataIndex: "category" },
      { title: "动作", dataIndex: "action" },
    ],
    rows: [],
    nextApis: ["GET/POST /admin/v1/sensitive-words"],
  },
  "config-taxonomy": {
    title: "城市与兴趣",
    blurb: "开放域兴趣 / 城市字典。",
    status: "live",
    iosRef: "InterestTaxonomy · Buddies 开放域",
    metrics: [
      { label: "兴趣标签", value: 48 },
      { label: "开放城市", value: 12 },
    ],
    columns: [
      { title: "类型", dataIndex: "type" },
      { title: "名称", dataIndex: "name" },
      { title: "权重", dataIndex: "weight" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { type: "兴趣", name: "夜跑", weight: 10, status: "启用" },
      { type: "城市", name: "杭州", weight: 9, status: "启用" },
    ],
    nextApis: ["GET/POST /admin/v1/taxonomies"],
  },
  "config-push": {
    title: "通知推送",
    blurb: "推送任务 stub：发送写入站内信。",
    status: "live",
    iosRef: "NotificationService · 深链",
    metrics: [
      { label: "模板数", value: 6 },
      { label: "今日送达", value: "—" },
    ],
    columns: [
      { title: "模板", dataIndex: "name" },
      { title: "场景", dataIndex: "scene" },
      { title: "渠道", dataIndex: "channel" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { name: "活动开始前提醒", scene: "活动", channel: "Push", status: "草稿" },
      { name: "预约即将开始", scene: "陪玩", channel: "Push", status: "草稿" },
    ],
    nextApis: ["GET/POST /admin/v1/push-campaigns"],
  },
  "config-announcements": {
    title: "公告与反馈",
    blurb: "公告发布 + 意见反馈工单。",
    status: "live",
    iosRef: "运营横切",
    columns: [
      { title: "标题", dataIndex: "title" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [],
    nextApis: ["GET /admin/v1/announcements", "GET /admin/v1/feedbacks"],
  },
  "config-sms": {
    title: "短信通道",
    blurb: "登录验证码通道与日限额。",
    status: "preview",
    iosRef: "Auth SMS · 开发码 123456",
    metrics: [
      { label: "今日发送", value: "—" },
      { label: "日限额", value: 20 },
    ],
    columns: [
      { title: "通道", dataIndex: "vendor" },
      { title: "场景", dataIndex: "scene" },
      { title: "状态", dataIndex: "status" },
    ],
    rows: [
      { vendor: "开发桩", scene: "登录验证码", status: "启用（dev）" },
      { vendor: "阿里云短信", scene: "登录验证码", status: "未配置" },
    ],
    nextApis: ["配置项已在 backend .env · 后续后台可视化"],
  },
  settings: {
    title: "系统设置",
    blurb: "管理员账号、角色权限与审计日志预留。",
    status: "preview",
    iosRef: "运营横切 · 非 App Tab",
    metrics: [
      { label: "管理员", value: 1 },
      { label: "角色", value: "super_admin" },
    ],
    columns: [
      { title: "账号", dataIndex: "user" },
      { title: "角色", dataIndex: "role" },
      { title: "最近登录", dataIndex: "login" },
    ],
    rows: [
      { user: "admin", role: "super_admin", login: "本会话" },
    ],
    nextApis: ["GET /admin/v1/admins", "审计日志"],
  },
};
