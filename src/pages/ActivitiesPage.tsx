import { useCallback, useEffect, useState } from "react";
import { Button, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import { fetchActivities, reviewActivity, type ActivityItem } from "../api/moderation";

export default function ActivitiesPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchActivities(status, limit, offset)
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total ?? 0);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [status, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<ActivityItem> = [
    { title: "标题", dataIndex: "title", ellipsis: true },
    { title: "主办", dataIndex: "host_name", width: 120, render: (v, r) => v || r.host_id },
    { title: "分类", dataIndex: "category", width: 100 },
    { title: "城市", dataIndex: "city", width: 100 },
    {
      title: "名额",
      width: 90,
      render: (_, r) => `${r.join_count}/${r.capacity}`,
    },
    { title: "状态", dataIndex: "status", width: 110, render: (s) => <Tag>{s}</Tag> },
    { title: "创建", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 160,
      render: (_, row) =>
        row.status === "pending" ? (
          <Can perm="activity:review">
            <Space>
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  reviewActivity(row.id, "approve")
                    .then(() => {
                      message.success("已通过");
                      load();
                    })
                    .catch((e: Error) => message.error(e.message))
                }
              >
                通过
              </Button>
              <Button
                size="small"
                danger
                onClick={() =>
                  reviewActivity(row.id, "reject", "不符合规范")
                    .then(() => {
                      message.success("已驳回");
                      load();
                    })
                    .catch((e: Error) => message.error(e.message))
                }
              >
                驳回
              </Button>
            </Space>
          </Can>
        ) : null,
    },
  ];

  return (
    <PageShell title="活动列表" desc="全状态活动列表；待审也可在「内容审核」处理。">
      <Space style={{ marginBottom: 12 }}>
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "all", label: "全部" },
            { value: "pending", label: "待审" },
            { value: "published", label: "已发布" },
            { value: "rejected", label: "已驳回" },
            { value: "cancelled", label: "已取消" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={{
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          onChange: (p) => setOffset((p - 1) * limit),
        }}
      />
    </PageShell>
  );
}
