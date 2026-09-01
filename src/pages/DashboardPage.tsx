import { Card, Col, Row, Statistic, Typography, Spin, Alert } from "antd";
import { useEffect, useState } from "react";
import { fetchDashboard, type DashboardSummary } from "../api/auth";

export default function DashboardPage() {
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
      <div style={{ padding: 48, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message={error || "无数据"} />;
  }

  return (
    <div>
      <Typography.Title level={3}>工作台</Typography.Title>
      <Typography.Paragraph type="secondary">
        当前账号：{data.admin}（{data.role}）
      </Typography.Paragraph>
      <Alert style={{ marginBottom: 16 }} type="info" showIcon message={data.notice} />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="用户总数" value={data.metrics.users_total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="今日匹配" value={data.metrics.matches_today} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="待处理举报" value={data.metrics.reports_pending} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="待审内容" value={data.metrics.moderation_pending} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
