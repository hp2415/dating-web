import {
  AlertOutlined,
  AuditOutlined,
  HeartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Card, Col, Row, Space, Spin, Statistic, Typography } from "antd";
import { useEffect, useState, type ReactNode } from "react";
import { fetchDashboard, type DashboardSummary } from "../api/auth";
import { getAdmin } from "../auth/session";

const CARD_METRICS: Array<{
  key: keyof DashboardSummary["metrics"];
  title: string;
  icon: ReactNode;
  start: string;
  end: string;
}> = [
  {
    key: "users_total",
    title: "用户总数",
    icon: <TeamOutlined />,
    start: "#ec4786",
    end: "#b955a4",
  },
  {
    key: "matches_today",
    title: "今日匹配",
    icon: <HeartOutlined />,
    start: "#865ec0",
    end: "#5144b4",
  },
  {
    key: "reports_pending",
    title: "待处理举报",
    icon: <AlertOutlined />,
    start: "#56cdf3",
    end: "#719de3",
  },
  {
    key: "moderation_pending",
    title: "待审内容",
    icon: <AuditOutlined />,
    start: "#fcbc25",
    end: "#f68057",
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

  if (error || !data) {
    return <Alert type="error" showIcon message={error || "无数据"} />;
  }

  const name = data.admin || admin?.display_name || admin?.username || "管理员";

  return (
    <Space className="w-full" direction="vertical" size={16}>
      <Card className="card-wrapper" bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <div className="dash-hello">
              <div className="dash-avatar">{name.slice(0, 1)}</div>
              <div>
                <Typography.Title level={4} className="dash-hello__title">
                  {greeting()}，{name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  今天也一起把审核队列和活动质量盯紧一点。
                </Typography.Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="dash-stats">
              <Statistic title="角色" value={data.role} />
              <Statistic title="待审内容" value={data.metrics.moderation_pending} />
              <Statistic title="待处理举报" value={data.metrics.reports_pending} />
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="card-wrapper" bordered={false} size="small">
        <Row gutter={[16, 16]}>
          {CARD_METRICS.map((item) => (
            <Col key={item.key} xs={24} md={12} lg={6}>
              <div
                className="metric-card"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${item.start}, ${item.end})` }}
              >
                <h3>{item.title}</h3>
                <div className="metric-card__row">
                  <span className="metric-card__icon">{item.icon}</span>
                  <strong>{data.metrics[item.key] ?? 0}</strong>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {data.notice ? (
        <Alert type="info" showIcon message={data.notice} className="card-wrapper" />
      ) : null}
    </Space>
  );
}
