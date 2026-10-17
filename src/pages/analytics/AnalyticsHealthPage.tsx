import { Card, Space, Table, Tabs, Tag } from "antd";
import { Line } from "@ant-design/plots";
import { useState } from "react";
import PageShell from "../../components/PageShell";
import { fetchAnalyticsErrors, fetchAnalyticsPerf } from "../../api/analytics";
import { RangeBar, defaultRange, ms, toParams, useLoader, type DayRange } from "./common";

const METRIC_LABELS: Record<string, string> = {
  "perf.cold_start": "冷启动",
  "perf.api_latency": "接口耗时",
  "perf.screen_rendered": "页面渲染",
};

export default function AnalyticsHealthPage() {
  const [range, setRange] = useState<DayRange>(defaultRange(7));
  const perf = useLoader(() => fetchAnalyticsPerf(toParams(range)), [range]);
  const errors = useLoader(() => fetchAnalyticsErrors(toParams(range)), [range]);

  return (
    <PageShell title="性能与错误" desc="冷启动、接口耗时（采样）、掉帧、崩溃与接口失败；错误明细最多回看 14 天。">
      <Space style={{ marginBottom: 16 }}>
        <RangeBar value={range} onChange={setRange} />
      </Space>
      <Card>
        <Tabs
          items={[
            {
              key: "perf",
              label: "性能",
              children: (
                <>
                  <Table
                    size="small"
                    rowKey={(r) => `${r.metric}-${r.app_version}`}
                    loading={perf.loading}
                    dataSource={perf.data?.items || []}
                    pagination={{ pageSize: 20 }}
                    columns={[
                      { title: "指标", render: (_, r) => METRIC_LABELS[r.metric] || r.metric },
                      { title: "版本", dataIndex: "app_version", width: 100 },
                      { title: "样本", dataIndex: "n", width: 90 },
                      { title: "平均", width: 90, render: (_, r) => ms(r.avg_ms) },
                      { title: "P50", width: 90, render: (_, r) => ms(r.p50_ms) },
                      { title: "P90", width: 90, render: (_, r) => ms(r.p90_ms) },
                      { title: "P99", width: 90, render: (_, r) => ms(r.p99_ms) },
                    ]}
                  />
                  <h4 style={{ marginTop: 24 }}>掉帧占比（%）</h4>
                  <Line
                    data={(perf.data?.jank || []).map((j) => ({ day: j.day.slice(5), value: j.jank_pct, ver: j.app_version || "?" }))}
                    xField="day"
                    yField="value"
                    colorField="ver"
                    height={220}
                  />
                </>
              ),
            },
            {
              key: "errors",
              label: "错误与崩溃",
              children: (
                <Table
                  size="small"
                  rowKey={(r) => `${r.event}-${r.key}-${r.app_version}`}
                  loading={errors.loading}
                  dataSource={errors.data?.items || []}
                  pagination={{ pageSize: 20 }}
                  columns={[
                    { title: "类型", dataIndex: "event", width: 160, render: (v: string) => <Tag color={v === "error.crash" ? "red" : "orange"}>{v}</Tag> },
                    { title: "位置 / 路径 / 异常", dataIndex: "key", ellipsis: true },
                    { title: "版本", dataIndex: "app_version", width: 100 },
                    { title: "次数", dataIndex: "count", width: 90, sorter: (a, b) => a.count - b.count },
                    { title: "设备数", dataIndex: "devices", width: 90 },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>
    </PageShell>
  );
}
