import { Card, Select, Space, Table, Tabs } from "antd";
import { useState } from "react";
import PageShell from "../../components/PageShell";
import { fetchAnalyticsPages, fetchAnalyticsUsage } from "../../api/analytics";
import { RangeBar, defaultRange, ms, toParams, useLoader, type DayRange } from "./common";

export default function AnalyticsUsagePage() {
  const [range, setRange] = useState<DayRange>(defaultRange(7));
  const [category, setCategory] = useState<string | undefined>();
  const usage = useLoader(() => fetchAnalyticsUsage(toParams(range)), [range]);
  const pages = useLoader(() => fetchAnalyticsPages(toParams(range)), [range]);
  const categories = Array.from(new Set((usage.data?.items || []).map((i) => i.category))).sort();
  const items = (usage.data?.items || []).filter((i) => !category || i.category === category);

  return (
    <PageShell title="功能与页面使用" desc="各事件的次数 / 日均触达人数，以及页面浏览量与平均停留。">
      <Space style={{ marginBottom: 16 }}>
        <RangeBar value={range} onChange={setRange} />
      </Space>
      <Card>
        <Tabs
          items={[
            {
              key: "features",
              label: "功能使用（事件）",
              children: (
                <>
                  <Select
                    allowClear
                    placeholder="按类别过滤"
                    style={{ width: 200, marginBottom: 12 }}
                    value={category}
                    onChange={setCategory}
                    options={categories.map((c) => ({ value: c, label: c }))}
                  />
                  <Table
                    size="small"
                    rowKey="event"
                    loading={usage.loading}
                    dataSource={items}
                    pagination={{ pageSize: 20 }}
                    columns={[
                      { title: "事件", dataIndex: "event" },
                      { title: "说明", dataIndex: "desc", ellipsis: true },
                      { title: "类别", dataIndex: "category", width: 100 },
                      { title: "次数", dataIndex: "events", width: 100, sorter: (a, b) => a.events - b.events },
                      { title: "日均人数", dataIndex: "avg_daily_users", width: 100 },
                      { title: "峰值人数", dataIndex: "peak_daily_users", width: 100 },
                    ]}
                  />
                </>
              ),
            },
            {
              key: "pages",
              label: "页面",
              children: (
                <Table
                  size="small"
                  rowKey="screen"
                  loading={pages.loading}
                  dataSource={pages.data?.items || []}
                  pagination={{ pageSize: 20 }}
                  columns={[
                    { title: "页面", dataIndex: "screen" },
                    { title: "浏览量 PV", dataIndex: "views", width: 120, sorter: (a, b) => a.views - b.views },
                    { title: "日均人数 UV", dataIndex: "avg_daily_users", width: 130 },
                    { title: "平均停留", width: 120, render: (_, r) => ms(r.avg_dwell_ms) },
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
