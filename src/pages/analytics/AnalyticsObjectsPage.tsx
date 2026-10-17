import { Card, Col, Row, Segmented, Select, Space, Statistic, Table } from "antd";
import { useState } from "react";
import PageShell from "../../components/PageShell";
import { fetchAnalyticsObjects } from "../../api/analytics";
import { RangeBar, defaultRange, pct, toParams, useLoader, type DayRange } from "./common";

const TYPES = [
  { value: "activity", label: "活动" },
  { value: "club", label: "俱乐部" },
  { value: "guild", label: "工会" },
  { value: "post", label: "帖子" },
  { value: "companion", label: "搭子" },
];
const ORDERS = [
  { value: "exposures", label: "曝光" },
  { value: "clicks", label: "点击" },
  { value: "details", label: "详情" },
  { value: "conversions", label: "转化" },
  { value: "paid", label: "付费" },
];

export default function AnalyticsObjectsPage() {
  const [range, setRange] = useState<DayRange>(defaultRange(7));
  const [type, setType] = useState("activity");
  const [order, setOrder] = useState("exposures");
  const { data, loading } = useLoader(() => fetchAnalyticsObjects(type, order, toParams(range)), [type, order, range]);
  const t = data?.totals || {};

  return (
    <PageShell
      title="对象转化"
      desc="每个活动 / 俱乐部 / 工会 / 帖子 / 搭子的曝光 → 点击 → 详情 → 转化。曝光口径：≥50% 可见且 ≥500ms，每会话每对象去重。"
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Segmented options={TYPES} value={type} onChange={(v) => setType(String(v))} />
        <RangeBar value={range} onChange={setRange} />
        <Select style={{ width: 130 }} value={order} onChange={setOrder} options={ORDERS.map((o) => ({ ...o, label: `按${o.label}排序` }))} />
      </Space>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {ORDERS.map((o) => (
          <Col key={o.value} xs={12} md={4}>
            <Card loading={loading}><Statistic title={o.label} value={t[o.value] ?? 0} /></Card>
          </Col>
        ))}
      </Row>
      <Card>
        <Table
          size="small"
          rowKey="object_id"
          loading={loading}
          dataSource={data?.items || []}
          pagination={{ pageSize: 20 }}
          columns={[
            { title: "对象", render: (_, r) => r.title || r.object_id, ellipsis: true },
            { title: "曝光", dataIndex: "exposures", width: 80 },
            { title: "曝光人数", dataIndex: "exposed_users", width: 90 },
            { title: "点击", dataIndex: "clicks", width: 80 },
            { title: "CTR", width: 80, render: (_, r) => pct(r.ctr) },
            { title: "详情", dataIndex: "details", width: 80 },
            { title: "转化", dataIndex: "conversions", width: 80 },
            { title: "转化率", width: 90, render: (_, r) => pct(r.conversion_rate) },
            { title: "付费", dataIndex: "paid", width: 80 },
          ]}
        />
      </Card>
    </PageShell>
  );
}
