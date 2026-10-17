import { Card, Empty, Select, Space, Table } from "antd";
import { Column } from "@ant-design/plots";
import { useState } from "react";
import PageShell from "../../components/PageShell";
import { fetchAnalyticsCatalog, fetchAnalyticsFunnel } from "../../api/analytics";
import { RangeBar, defaultRange, eventLabel, pct, toParams, useLoader, type DayRange } from "./common";

export default function AnalyticsFunnelPage() {
  const [range, setRange] = useState<DayRange>(defaultRange(7));
  const [name, setName] = useState("core");
  const catalog = useLoader(() => fetchAnalyticsCatalog(), []);
  const { data, loading } = useLoader(() => fetchAnalyticsFunnel(name, toParams(range)), [name, range]);

  return (
    <PageShell title="转化漏斗" desc="按设备/用户去重，有序漏斗：每一步必须发生在上一步之后（同一人）。">
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          style={{ width: 240 }}
          value={name}
          onChange={setName}
          options={(catalog.data?.funnels || [{ key: "core", label: "核心链路" }]).map((f) => ({
            value: f.key,
            label: f.label,
          }))}
        />
        <RangeBar value={range} onChange={setRange} />
      </Space>
      <Card loading={loading}>
        {data?.steps?.length ? (
          <>
            <Column
              data={data.steps.map((s) => ({ step: `${s.index + 1}. ${eventLabel(s.event)}`, users: s.users }))}
              xField="step"
              yField="users"
              height={280}
              axis={{ x: { labelAutoRotate: true } }}
            />
            <Table
              size="small"
              rowKey="index"
              pagination={false}
              dataSource={data.steps}
              columns={[
                { title: "步骤", render: (_, s) => `${s.index + 1}. ${eventLabel(s.event)}` },
                { title: "事件", dataIndex: "event" },
                { title: "人数", dataIndex: "users", width: 100 },
                { title: "较上一步", width: 110, render: (_, s) => pct(s.rate_from_prev) },
                { title: "较第一步", width: 110, render: (_, s) => pct(s.rate_from_first) },
              ]}
            />
          </>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>
    </PageShell>
  );
}
