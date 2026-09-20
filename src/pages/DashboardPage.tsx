import {
  AlertOutlined,
  AuditOutlined,
  CalendarOutlined,
  HeartOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Alert, Card, Col, List, Row, Space, Spin, Statistic, Tag, Typography } from "antd";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard, type DashboardSummary } from "../api/auth";
import { getAdmin } from "../auth/session";

const CARD_METRICS: Array<{
  key: keyof DashboardSummary["metrics"];
  title: string;
  icon: ReactNode;
  start: string;
  end: string;
  to?: string;
}> = [
  {
    key: "users_total",
    title: "用户总数",
    icon: <TeamOutlined />,
    start: "#4facfe",
    end: "#267EF0",
    to: "/users",
  },
  {
    key: "matches_today",
    title: "今日匹配",
    icon: <HeartOutlined />,
    start: "#43e97b",
    end: "#38f9d7",
    to: "/buddies/free",
  },
  {
    key: "reports_pending",
    title: "待处理举报",
    icon: <AlertOutlined />,
    start: "#fa709a",
    end: "#fee140",
    to: "/moderation",
  },
  {
    key: "moderation_pending",
    title: "待审内容",
    icon: <AuditOutlined />,
    start: "#a18cd1",
    end: "#fbc2eb",
    to: "/moderation",
  },
];

const QUICK_LINKS = [
  {
    title: "内容审核",
    desc: "活动 / 举报 / 媒体 / 动态",
    to: "/moderation",
    icon: <AuditOutlined />,
    live: true,
  },
  {
    title: "活动列表",
    desc: "场 · 发现与主办",
    to: "/activities",
    icon: <CalendarOutlined />,
    live: true,
  },
  {
    title: "陪玩服务者",
    desc: "搭子 · 预约路径",
    to: "/buddies/paid",
    icon: <TeamOutlined />,
    live: true,
  },
  {
    title: "订单中心",
    desc: "活动 + 预约履约",
    to: "/orders",
    icon: <WalletOutlined />,
    live: true,
  },
  {
    title: "信任档案",
    desc: "分数 · 事件 · 加减分",
    to: "/users/trust",
    icon: <SafetyCertificateOutlined />,
    live: true,
  },
  {
    title: "举报处置",
    desc: "用户举报工单",
    to: "/safety/reports",
    icon: <AlertOutlined />,
    live: true,
  },
  {
    title: "城市与兴趣",
    desc: "开放域字典",
    to: "/config/taxonomy",
    icon: <TeamOutlined />,
    live: true,
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export default function DashboardPage() {
  const admin = getAdmin();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err?.message || "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <Spin size="large" />
      </div>
    );
  }

  const name = data?.admin || admin?.display_name || admin?.username || "管理员";
  const metrics = data?.metrics;

  return (
    <Space className="w-full" direction="vertical" size={16}>
      <Card className="card-wrapper dash-banner" bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <div className="dash-hello">
              <div className="dash-avatar">{name.slice(0, 1)}</div>
              <div>
                <Typography.Title level={4} className="dash-hello__title">
                  {greeting()}，{name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  找搭子运营台 · 活动（场）· 搭子（人）· 广场 · 履约 · 信任
                </Typography.Text>
                <div className="dash-tags">
                  <Tag color="processing">企微蓝主题</Tag>
                  <Tag>对齐 iOS 信息架构</Tag>
                  {data?.role ? <Tag>{data.role}</Tag> : null}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="dash-stats">
              <Statistic title="待审内容" value={metrics?.moderation_pending ?? "—"} />
              <Statistic title="待处理举报" value={metrics?.reports_pending ?? "—"} />
            </div>
          </Col>
        </Row>
      </Card>

      {error ? <Alert type="warning" showIcon message={`看板接口：${error}（仍可浏览预览菜单）`} /> : null}
      {data?.notice ? <Alert type="info" showIcon message={data.notice} /> : null}

      <Row gutter={[16, 16]}>
        {CARD_METRICS.map((item) => {
          const body = (
            <div
              className="metric-card"
              style={{ backgroundImage: `linear-gradient(to bottom right, ${item.start}, ${item.end})` }}
            >
              <h3>{item.title}</h3>
              <div className="metric-card__row">
                <span className="metric-card__icon">{item.icon}</span>
                <strong>{metrics?.[item.key] ?? "—"}</strong>
              </div>
            </div>
          );
          return (
            <Col key={item.key} xs={24} md={12} lg={6}>
              {item.to ? (
                <Link to={item.to} className="metric-card-link">
                  {body}
                </Link>
              ) : (
                body
              )}
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="card-wrapper" bordered={false} title="快捷入口">
            <List
              grid={{ gutter: 12, xs: 1, sm: 2 }}
              dataSource={QUICK_LINKS}
              renderItem={(item) => (
                <List.Item>
                  <Link to={item.to} className="quick-link">
                    <span className="quick-link__icon">{item.icon}</span>
                    <span className="quick-link__body">
                      <strong>
                        {item.title}
                        {item.live ? <Tag color="processing">Live</Tag> : <Tag>预览</Tag>}
                      </strong>
                      <em>{item.desc}</em>
                    </span>
                    <RightOutlined className="quick-link__arrow" />
                  </Link>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="card-wrapper" bordered={false} title="今日运营建议">
            <List
              size="small"
              dataSource={[
                "优先清空活动待审，保证「场」信息流新鲜度",
                "举报工单按 Safety 权重处理，再看内容贡献",
                "陪玩上架前核验真人认证与定价合规",
                "货架 / 兴趣字典已可配置，按城市灰度上架",
              ]}
              renderItem={(text) => <List.Item>{text}</List.Item>}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
