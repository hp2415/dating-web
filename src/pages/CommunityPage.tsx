import { useCallback, useEffect, useState } from "react";
import { Button, Image, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  fetchCommunityPosts,
  reviewCommunityPost,
  type CommunityPostItem,
} from "../api/moderation";

export default function CommunityPage() {
  const [items, setItems] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchCommunityPosts(status, limit, offset)
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

  const columns: ColumnsType<CommunityPostItem> = [
    { title: "作者", dataIndex: "author_name", width: 120, render: (v, r) => v || r.author_id },
    { title: "内容", dataIndex: "content", ellipsis: true },
    {
      title: "媒体",
      width: 100,
      render: (_, r) => {
        const first = (r.media || []).find((m) => m.url);
        return first?.url ? <Image src={first.url} width={48} height={48} style={{ objectFit: "cover" }} /> : "—";
      },
    },
    { title: "赞", dataIndex: "like_count", width: 70 },
    { title: "评", dataIndex: "comment_count", width: 70 },
    { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
    { title: "创建", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 160,
      render: (_, row) =>
        row.status === "pending" ? (
          <Can perm="community:review">
            <Space>
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  reviewCommunityPost(row.id, "approve")
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
                  reviewCommunityPost(row.id, "reject", "不符合规范")
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
    <PageShell title="动态管理" desc="广场种草 / 复盘流；待审也可在「内容审核 · 历史动态」处理。">
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
