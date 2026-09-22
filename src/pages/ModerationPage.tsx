import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Image,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Can from "../components/Can";
import {
  fetchActivities,
  fetchCommunityPosts,
  fetchMedia,
  reviewActivity,
  reviewCommunityPost,
  reviewMedia,
  type ActivityItem,
  type CommunityPostItem,
  type MediaItem,
} from "../api/moderation";
import {
  claimModerationTask,
  fetchModerationReasonCodes,
  fetchModerationTasks,
  reviewModerationTask,
  type ModerationTaskItem,
  type ReasonCodeItem,
} from "../api/trust";

export default function ModerationPage() {
  return (
    <div className="card-wrapper moderation-page">
      <Typography.Title level={4} className="page-title">
        内容审核
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        已接后端：活动为主，媒体 / 历史动态并行处理。举报工单请到「安全治理 · 举报处置」。对齐 iOS 发布待审 →
        运营过审 → 信息流。
      </Typography.Paragraph>
      <Tabs
        items={[
          { key: "tasks", label: "统一队列", children: <ModerationTasksPanel /> },
          { key: "activities", label: "活动审核", children: <ActivitiesPanel /> },
          { key: "media", label: "媒体审核", children: <MediaPanel /> },
          { key: "posts", label: "历史动态", children: <CommunityPanel /> },
        ]}
      />
    </div>
  );
}

function MediaPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [detail, setDetail] = useState<MediaItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchMedia(status)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err?.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const onReview = async (id: string, action: "approve" | "reject") => {
    try {
      await reviewMedia(id, action);
      message.success(action === "approve" ? "已通过" : "已驳回");
      setDetail(null);
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "审核失败");
    }
  };

  const columns: ColumnsType<MediaItem> = [
    {
      title: "预览",
      dataIndex: "url",
      width: 100,
      render: (url) => <Image src={url} width={64} height={64} style={{ objectFit: "cover" }} />,
    },
    {
      title: "上传者",
      dataIndex: "owner_name",
      render: (v, row) => v || row.owner_id.slice(0, 8),
    },
    { title: "类型", dataIndex: "media_type" },
    {
      title: "状态",
      dataIndex: "audit_status",
      render: (v) => <Tag color={v === "pending" ? "orange" : v === "approved" ? "green" : "red"}>{v}</Tag>,
    },
    { title: "时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      key: "action",
      render: (_, row) => (
        <Button type="link" onClick={() => setDetail(row)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: "pending", label: "待审" },
            { value: "approved", label: "已通过" },
            { value: "rejected", label: "已驳回" },
            { value: "all", label: "全部" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={false}
        onRow={(row) => ({ onClick: () => setDetail(row), style: { cursor: "pointer" } })}
      />
      <Drawer
        width={520}
        title="媒体详情"
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        {detail && (
          <>
            {detail.url ? (
              <Image src={detail.url} style={{ maxWidth: "100%", marginBottom: 16 }} />
            ) : null}
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="媒体 ID">{detail.id}</Descriptions.Item>
              <Descriptions.Item label="上传者">
                {detail.owner_name || detail.owner_id}
              </Descriptions.Item>
              <Descriptions.Item label="类型">{detail.media_type}</Descriptions.Item>
              <Descriptions.Item label="状态">{detail.audit_status}</Descriptions.Item>
              <Descriptions.Item label="时间">{detail.created_at}</Descriptions.Item>
            </Descriptions>
            {detail.audit_status === "pending" ? (
              <Can perm="media:review">
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
    </>
  );
}

function CommunityPanel() {
  const [items, setItems] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [detail, setDetail] = useState<CommunityPostItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCommunityPosts(status)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err?.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const onReview = async (id: string, action: "approve" | "reject") => {
    try {
      await reviewCommunityPost(id, action);
      message.success(action === "approve" ? "已发布" : "已驳回");
      setDetail(null);
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "审核失败");
    }
  };

  const columns: ColumnsType<CommunityPostItem> = [
    {
      title: "作者",
      dataIndex: "author_name",
      render: (v, row) => v || row.author_id.slice(0, 8),
    },
    { title: "内容", dataIndex: "content", ellipsis: true },
    {
      title: "媒体",
      dataIndex: "media",
      width: 140,
      render: (media: CommunityPostItem["media"]) =>
        media?.length ? (
          <Space>
            {media.slice(0, 2).map((m, i) =>
              m.type === "image" && m.url ? (
                <Image key={i} src={m.url} width={48} height={48} style={{ objectFit: "cover" }} />
              ) : (
                <Tag key={i}>{m.type}</Tag>
              ),
            )}
          </Space>
        ) : (
          "-"
        ),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => (
        <Tag color={v === "pending" ? "orange" : v === "published" ? "green" : "red"}>{v}</Tag>
      ),
    },
    { title: "时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      key: "action",
      render: (_, row) => (
        <Button type="link" onClick={() => setDetail(row)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: "pending", label: "待审" },
            { value: "published", label: "已发布" },
            { value: "rejected", label: "已驳回" },
            { value: "all", label: "全部" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={false}
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
              {detail.admin_note ? (
                <Descriptions.Item label="备注">{detail.admin_note}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="时间">{detail.created_at}</Descriptions.Item>
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
    </>
  );
}

function ActivitiesPanel() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [detail, setDetail] = useState<ActivityItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchActivities(status)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err?.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const onReview = async (id: string, action: "approve" | "reject") => {
    try {
      await reviewActivity(id, action);
      message.success(action === "approve" ? "活动已发布" : "活动已驳回");
      setDetail(null);
      load();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : "审核失败");
    }
  };

  const columns: ColumnsType<ActivityItem> = [
    {
      title: "发起人",
      dataIndex: "host_name",
      render: (v, row) => v || row.host_id.slice(0, 8),
    },
    { title: "标题", dataIndex: "title", ellipsis: true },
    { title: "分类", dataIndex: "category", width: 90 },
    {
      title: "地点",
      key: "place",
      ellipsis: true,
      render: (_, row) => [row.city, row.address].filter(Boolean).join(" · ") || "-",
    },
    {
      title: "时间",
      dataIndex: "start_at",
      width: 170,
      render: (v) => v || "-",
    },
    {
      title: "人数",
      key: "cap",
      width: 80,
      render: (_, row) => `${row.join_count}/${row.capacity}`,
    },
    {
      title: "封面",
      dataIndex: "media",
      width: 80,
      render: (media: ActivityItem["media"]) => {
        const img = media?.find((m) => m.type === "image" && m.url);
        return img?.url ? (
          <Image src={img.url} width={48} height={48} style={{ objectFit: "cover" }} />
        ) : (
          "-"
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => (
        <Tag color={v === "pending" ? "orange" : v === "published" ? "green" : "red"}>{v}</Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, row) => (
        <Button type="link" onClick={() => setDetail(row)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: "pending", label: "待审" },
            { value: "published", label: "已发布" },
            { value: "rejected", label: "已驳回" },
            { value: "all", label: "全部" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={false}
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
    </>
  );
}

function ModerationTasksPanel() {
  const [items, setItems] = useState<ModerationTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [reasonCodes, setReasonCodes] = useState<ReasonCodeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [detail, setDetail] = useState<ModerationTaskItem | null>(null);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchModerationTasks({ status: status === "all" ? undefined : status, limit, offset })
      .then((d: { items?: ModerationTaskItem[]; total?: number }) => {
        setItems(d.items || []);
        setTotal(d.total ?? 0);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [status, offset]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchModerationReasonCodes()
      .then((d: { items?: ReasonCodeItem[] }) => setReasonCodes(d.items || []))
      .catch(() => setReasonCodes([]));
  }, []);

  const onReview = (row: ModerationTaskItem, action: "approve" | "reject") => {
    if (action === "approve") {
      reviewModerationTask(row.id, { action: "approve" })
        .then(() => {
          message.success("已通过");
          setDetail(null);
          load();
        })
        .catch((e: Error) => message.error(e.message));
      return;
    }
    let reasonCode = reasonCodes[0]?.code || "other";
    let note = "";
    Modal.confirm({
      title: "驳回任务",
      content: (
        <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
          <Select
            defaultValue={reasonCode}
            style={{ width: "100%" }}
            options={reasonCodes.map((c) => ({ value: c.code, label: c.label }))}
            onChange={(v) => {
              reasonCode = v;
            }}
          />
          <Input.TextArea
            rows={3}
            placeholder="备注（可选）"
            onChange={(e) => {
              note = e.target.value;
            }}
          />
        </Space>
      ),
      onOk: async () => {
        if (!reasonCode) {
          message.error("请选择驳回原因码");
          throw new Error("missing reason");
        }
        await reviewModerationTask(row.id, {
          action: "reject",
          reason_code: reasonCode,
          admin_note: note || undefined,
        });
        message.success("已驳回");
        setDetail(null);
        load();
      },
    });
  };

  const columns: ColumnsType<ModerationTaskItem> = [
    { title: "类型", dataIndex: "target_kind", width: 100 },
    { title: "对象", dataIndex: "target_id", ellipsis: true },
    { title: "机审", dataIndex: "machine_label", width: 90 },
    {
      title: "优先级",
      dataIndex: "priority",
      width: 80,
      render: (v) => v ?? 0,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      render: (v) => <Tag color={v === "pending" ? "orange" : v === "reviewing" ? "blue" : "default"}>{v}</Tag>,
    },
    { title: "提交", dataIndex: "submitted_at", width: 180 },
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

  const payloadText =
    detail?.payload && Object.keys(detail.payload).length
      ? JSON.stringify(detail.payload, null, 2)
      : null;

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "pending", label: "待审" },
            { value: "reviewing", label: "审核中" },
            { value: "approved", label: "已通过" },
            { value: "rejected", label: "已驳回" },
            { value: "all", label: "全部" },
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
          onChange: (page) => setOffset((page - 1) * limit),
        }}
        onRow={(row) => ({ onClick: () => setDetail(row), style: { cursor: "pointer" } })}
      />
      <Drawer
        width={560}
        title="审核任务详情"
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="任务 ID">{detail.id}</Descriptions.Item>
              <Descriptions.Item label="类型">{detail.target_kind}</Descriptions.Item>
              <Descriptions.Item label="对象 ID">{detail.target_id}</Descriptions.Item>
              {detail.machine_label ? (
                <Descriptions.Item label="机审">{detail.machine_label}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="状态">{detail.status}</Descriptions.Item>
              {detail.assignee_admin_id ? (
                <Descriptions.Item label="认领人">{detail.assignee_admin_id}</Descriptions.Item>
              ) : null}
              {detail.submitted_at ? (
                <Descriptions.Item label="提交">{detail.submitted_at}</Descriptions.Item>
              ) : null}
              {detail.admin_note ? (
                <Descriptions.Item label="备注">{detail.admin_note}</Descriptions.Item>
              ) : null}
            </Descriptions>
            {payloadText ? (
              <Typography.Paragraph style={{ marginTop: 16 }}>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{payloadText}</pre>
              </Typography.Paragraph>
            ) : null}
            <Can perm="moderation:write">
              <Space style={{ marginTop: 16 }} wrap>
                {(detail.status === "pending" || !detail.assignee_admin_id) && (
                  <Button
                    onClick={() =>
                      claimModerationTask(detail.id)
                        .then(() => {
                          message.success("已认领");
                          load();
                          setDetail({ ...detail, status: "reviewing" });
                        })
                        .catch((e: Error) => message.error(e.message))
                    }
                  >
                    认领
                  </Button>
                )}
                {detail.status !== "approved" && detail.status !== "rejected" && (
                  <>
                    <Button type="primary" onClick={() => onReview(detail, "approve")}>
                      通过
                    </Button>
                    <Button danger onClick={() => onReview(detail, "reject")}>
                      驳回
                    </Button>
                  </>
                )}
              </Space>
            </Can>
          </>
        )}
      </Drawer>
    </>
  );
}
