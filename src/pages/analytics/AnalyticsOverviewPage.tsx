import { Alert, Button, Card, Col, Popconfirm, Row, Space, Statistic, Table, message } from "antd";
import { Line } from "@ant-design/plots";
import { useMemo, useState } from "react";
import PageShell from "../../components/PageShell";
import Can from "../../components/Can";
import { errorMessage, fetchAnalyticsOverview, rebuildAnalytics } from "../../api/analytics";
import { pct, useLoader } from "./common";

const RETENTION_KEYS = ["d1", "d3", "d7", "d14", "d30"];

export default function AnalyticsOverviewPage() {
  const [days, setDays] = useState(14);
  const { data, loading, reload } = useLoader(() => fetchAnalyticsOverview(days), [days]);
  const [busy, setBusy] = useState(false);

  const trend = useMemo(
    () =>
      (data?.series || []).flatMap((p) => [
        { day: p.day.slice(5), type: "DAU", value: p.dau },
        { day: p.day.slice(5), type: "WAU", value: p.wau },
        { day: p.day.slice(5), type: "MAU", value: p.mau },
      ]),
    [data],
  );
  const sessions = useMemo(
    () => (data?.series || []).map((p) => ({ day: p.day.slice(5), value: p.sessions })),
    [data],
  );
  const latest = data?.latest;

  const rebuild = async () => {
    setBusy(true);
    try {
      await rebuildAnalytics(Math.min(days, 14));
      message.success("已重算");
      reload();
    } catch (e) {
      message.error(await errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="数据概览"
      desc="活跃、会话与留存（按设备口径，每日夜间任务生成；今天的数据为截至上次聚合）。"
      extra={
        <Space>
          <Button.Group>
            {[7, 14, 30].map((d) => (
              <Button key={d} type={days === d ? "primary" : "default"} onClick={() => setDays(d)}>
                近 {d} 天
              </Button>
            ))}
          </Button.Group>
          <Can perm="analytics:rebuild">
            <Popconfirm title={`重算最近 ${Math.min(days, 14)} 天聚合？`} onConfirm={rebuild}>
              <Button loading={busy}>重算聚合</Button>
            </Popconfirm>
          </Can>
        </Space>
      }
    >
      {!loading && !latest ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="暂无聚合数据"
          description="客户端上报事件后，夜间任务会生成；也可点「重算聚合」手动回填（需要权限）。"
        />
      ) : null}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={4}><Card loading={loading}><Statistic title="DAU" value={latest?.dau ?? 0} /></Card></Col>
        <Col xs={12} md={4}><Card loading={loading}><Statistic title="WAU" value={latest?.wau ?? 0} /></Card></Col>
        <Col xs={12} md={4}><Card loading={loading}><Statistic title="MAU" value={latest?.mau ?? 0} /></Card></Col>
        <Col xs={12} md={4}><Card loading={loading}><Statistic title="粘性 DAU/MAU" value={pct(data?.stickiness)} /></Card></Col>
        <Col xs={12} md={4}><Card loading={loading}><Statistic title="会话数" value={latest?.sessions ?? 0} /></Card></Col>
        <Col xs={12} md={4}>
          <Card loading={loading}>
            <Statistic title="平均会话" value={latest ? Math.round(latest.avg_session_seconds) : 0} suffix="秒" />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="活跃趋势" loading={loading}>
            <Line data={trend} xField="day" yField="value" colorField="type" height={260} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="会话数" loading={loading}>
            <Line data={sessions} xField="day" yField="value" height={260} />
          </Card>
        </Col>
      </Row>
      <Card title="新增设备与设备留存" style={{ marginTop: 16 }}>
        <Table
          size="small"
          rowKey="day"
          loading={loading}
          pagination={{ pageSize: 14 }}
          dataSource={[...(data?.series || [])].reverse()}
          columns={[
            { title: "日期", dataIndex: "day", width: 110 },
            { title: "新增设备", dataIndex: "new_devices", width: 100 },
            ...RETENTION_KEYS.map((k) => ({
              title: `${k.toUpperCase()} 留存`,
              key: k,
              render: (_: unknown, row: { retention: Record<string, number | null> }) => pct(row.retention?.[k]),
            })),
          ]}
        />
      </Card>
    </PageShell>
  );
}
