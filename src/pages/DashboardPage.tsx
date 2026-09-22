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
import { Column, Line } from "@ant-design/plots";
import { Alert, Button, Card, Col, DatePicker, List, Row, Space, Spin, Statistic, Tag, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard, type DashboardSummary } from "../api/auth";
import {
  fetchMetricsFunnel,
  fetchMetricsOverview,
  rebuildMetrics,
  type MetricsFunnel,
  type MetricsOverview,
} from "../api/metrics";
import { getAdmin } from "../auth/session";

const FUNNEL_LABELS: Record<string, string> = {
  "app.launched": "启动",
  "auth.login_succeeded": "登录成功",
  "activity.detail_viewed": "看活动",
  "activity.join_succeeded": "参加活动",
  "companion.booking_created": "陪玩下单",
  "commerce.pay_succeeded": "支付成功",
};

const CORE_METRICS: Array<{ key: keyof MetricsOverview["totals"]; title: string; money?: boolean }> = [
  { key: "dau", title: "活跃" },
  { key: "new_users", title: "新增用户" },
  { key: "activities_published", title: "发布活动" },
  { key: "orders_paid", title: "支付订单" },
  { key: "gmv_cents", title: "GMV", money: true },
];

function formatChange(value: number | null | undefined) {
  if (value == null) return "无对比";
  const percent = Math.round(value * 1000) / 10;
  return percent > 0 ? `环比 +${percent}%` : `环比 ${percent}%`;
}

function formatMetric(value: number, money?: boolean) {
  if (money) return `¥${(value / 100).toFixed(2)}`;
  return String(value);
}

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
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [funnel, setFunnel] = useState<MetricsFunnel | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(6, "day"), dayjs()]);

  const loadMetrics = async (nextRange: [Dayjs, Dayjs], rebuildIfEmpty = false) => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      let summary = await fetchMetricsOverview(7);
      if (rebuildIfEmpty && summary.series.length === 0) {
        await rebuildMetrics(7);
        summary = await fetchMetricsOverview(7);
      }
      setOverview(summary);
      setFunnel(
        await fetchMetricsFunnel(nextRange[0].format("YYYY-MM-DD"), nextRange[1].format("YYYY-MM-DD")),
      );
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : "统计加载失败");
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err?.message || "加载失败"))
      .finally(() => setLoading(false));
    void loadMetrics(range, true);
    // Initial load only. Date changes go through the picker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <Card
        className="card-wrapper"
        bordered={false}
        title="近 7 日核心指标"
        extra={
          <Button size="small" loading={metricsLoading} onClick={() => void loadMetrics(range, true)}>
            重新生成
          </Button>
        }
      >
        {metricsError ? <Alert type="warning" showIcon message={metricsError} style={{ marginBottom: 16 }} /> : null}
        <Row gutter={[16, 16]}>
          {CORE_METRICS.map((item) => (
            <Col key={item.key} xs={12} md={8} lg={4}>
              <Statistic
                title={item.title}
                value={formatMetric(overview?.totals?.[item.key] ?? 0, item.money)}
              />
              <Typography.Text type="secondary">{formatChange(overview?.change?.[item.key])}</Typography.Text>
            </Col>
          ))}
        </Row>
        <div style={{ marginTop: 16 }}>
          <Line
            data={
              overview?.series?.length
                ? overview.series.map((point) => ({ day: point.day.slice(5), dau: point.dau }))
                : [{ day: "暂无", dau: 0 }]
            }
            xField="day"
            yField="dau"
            height={180}
          />
        </div>
      </Card>

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
          <Card
            className="card-wrapper"
            bordered={false}
            title="转化漏斗"
            extra={
              <DatePicker.RangePicker
                value={range}
                allowClear={false}
                onChange={(value) => {
                  if (!value || !value[0] || !value[1]) return;
                  const next: [Dayjs, Dayjs] = [value[0], value[1]];
                  setRange(next);
                  void loadMetrics(next);
                }}
              />
            }
          >
            {metricsError ? <Alert type="warning" showIcon message={metricsError} /> : null}
            <Column
              data={
                funnel?.steps?.length
                  ? funnel.steps.map((step) => ({
                      step: FUNNEL_LABELS[step.event] || step.event,
                      count: step.count,
                    }))
                  : [{ step: "暂无", count: 0 }]
              }
              xField="step"
              yField="count"
              height={220}
              axis={{ x: { labelAutoRotate: true } }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
