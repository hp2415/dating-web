import { useCallback, useEffect, useState } from "react";
import { Button, Descriptions, Drawer, Image, Select, Space, Table, Tag, Typography, message } from "antd";
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
  const [detail, setDetail] = useState<CommunityPostItem | null>(null);
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

  const onReview = (id: string, action: "approve" | "reject") => {
    reviewCommunityPost(id, action, action === "reject" ? "不符合规范" : undefined)
      .then(() => {
        message.success(action === "approve" ? "已通过" : "已驳回");
        setDetail(null);
        load();
      })
      .catch((e: Error) => message.error(e.message));
  };

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
      width: 100,
      render: (_, row) => (
        <Button type="link" onClick={() => setDetail(row)}>
          详情
        </Button>
      ),
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
        onRow={(row) => ({ onClick: () => setDetail(row), style: { cursor: "pointer" } })}
      />
      <Drawer
        width={560}
        title="动态详情"
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        {detail && (
          <>
            <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>{detail.content}</Typography.Paragraph>
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
              <Descriptions.Item label="动态 ID">{detail.id}</Descriptions.Item>
              <Descriptions.Item label="作者">{detail.author_name || detail.author_id}</Descriptions.Item>
              <Descriptions.Item label="作者 ID">{detail.author_id}</Descriptions.Item>
              <Descriptions.Item label="状态">{detail.status}</Descriptions.Item>
              <Descriptions.Item label="赞 / 评">
                {detail.like_count} / {detail.comment_count}
              </Descriptions.Item>
              {detail.admin_note ? (
                <Descriptions.Item label="备注">{detail.admin_note}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="创建">{detail.created_at}</Descriptions.Item>
            </Descriptions>
            {detail.status === "pending" ? (
              <Can perm="community:review">
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
