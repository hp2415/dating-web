import { useCallback, useEffect, useState } from "react";
import { Button, Descriptions, Drawer, Image, Select, Space, Table, Tag, Typography, message } from "antd";
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
  const [detail, setDetail] = useState<ActivityItem | null>(null);
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

  const onReview = (id: string, action: "approve" | "reject") => {
    reviewActivity(id, action, action === "reject" ? "不符合规范" : undefined)
      .then(() => {
        message.success(action === "approve" ? "已通过" : "已驳回");
        setDetail(null);
        load();
      })
      .catch((e: Error) => message.error(e.message));
  };

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
      width: 100,
      render: (_, row) => (
        <Button type="link" onClick={() => setDetail(row)}>
          详情
        </Button>
      ),
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
        onRow={(row) => ({ onClick: () => setDetail(row), style: { cursor: "pointer" } })}
      />
      <Drawer
        width={560}
        title="活动详情"
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        {detail && (
          <>
            <Typography.Title level={5}>{detail.title}</Typography.Title>
            <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
              {detail.description}
            </Typography.Paragraph>
            {detail.media?.length ? (
              <Space wrap style={{ marginBottom: 16 }}>
                {detail.media.map((m, i) =>
                  m.url ? (
                    <Image key={i} src={m.url} width={120} height={120} style={{ objectFit: "cover" }} />
                  ) : null,
                )}
              </Space>
            ) : null}
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="活动 ID">{detail.id}</Descriptions.Item>
              <Descriptions.Item label="主办">{detail.host_name || detail.host_id}</Descriptions.Item>
              <Descriptions.Item label="主办 ID">{detail.host_id}</Descriptions.Item>
              <Descriptions.Item label="分类">{detail.category}</Descriptions.Item>
              {(detail.city || detail.address) && (
                <Descriptions.Item label="地点">
                  {[detail.city, detail.address].filter(Boolean).join(" · ")}
                </Descriptions.Item>
              )}
              {detail.start_at ? (
                <Descriptions.Item label="开始">{detail.start_at}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="名额">
                {detail.join_count}/{detail.capacity}
              </Descriptions.Item>
              <Descriptions.Item label="状态">{detail.status}</Descriptions.Item>
              {detail.admin_note ? (
                <Descriptions.Item label="备注">{detail.admin_note}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="创建">{detail.created_at}</Descriptions.Item>
            </Descriptions>
            {detail.status === "pending" ? (
              <Can perm="activity:review">
                <Space style={{ marginTop: 16 }}>
                  <Button type="primary" onClick={() => onReview(detail.id, "approve")}>
                    通过
                  </Button>
                  <Button danger onClick={() => onReview(detail.id, "reject")}>
                    驳回
                  </Button>
                </Space>
              </Can>
            ) : null}
          </>
        )}
      </Drawer>
    </PageShell>
  );
}
