import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
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
import {
  fetchActivities,
  fetchCommunityPosts,
  fetchMedia,
  fetchReports,
  resolveReport,
  reviewActivity,
  reviewCommunityPost,
  reviewMedia,
  type ActivityItem,
  type CommunityPostItem,
  type MediaItem,
  type ReportItem,
} from "../api/moderation";

const REASON_LABEL: Record<string, string> = {
  spam: "垃圾信息",
  harassment: "骚扰",
  inappropriate: "不当内容",
  fake: "虚假资料",
  other: "其他",
};

const RESOLUTION_OPTIONS = [
  { value: "dismiss", label: "驳回" },
  { value: "warn", label: "警告" },
  { value: "limit", label: "限流" },
  { value: "ban", label: "封禁" },
];

export default function ModerationPage() {
  return (
    <div className="card-wrapper moderation-page">
      <Typography.Title level={4} className="page-title">
        内容审核
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        找搭子运营审核：活动为主，举报/媒体/历史动态并行处理。
      </Typography.Paragraph>
      <Tabs
        items={[
          { key: "activities", label: "活动审核", children: <ActivitiesPanel /> },
          { key: "reports", label: "举报工单", children: <ReportsPanel /> },
          { key: "media", label: "媒体审核", children: <MediaPanel /> },
          { key: "posts", label: "历史动态", children: <CommunityPanel /> },
        ]}
      />
    </div>
  );
}

function ReportsPanel() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [actingId, setActingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState("dismiss");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ReportItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchReports(status)
      .then((data) => setItems(data.items))
      .catch((err) => setError(err?.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<ReportItem> = [
    {
      title: "举报人",
      dataIndex: "reporter_name",
      render: (v, row) => v || row.reporter_id.slice(0, 8),
    },
    {
      title: "被举报人",
      dataIndex: "target_name",
      render: (v, row) => v || row.target_user_id.slice(0, 8),
    },
    {
      title: "原因",
      dataIndex: "reason",
      render: (v) => REASON_LABEL[v] || v,
    },
    { title: "说明", dataIndex: "detail", ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => <Tag color={v === "pending" ? "orange" : "default"}>{v}</Tag>,
    },
    { title: "时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      key: "action",
      render: (_, row) =>
        row.status === "pending" ? (
          <Button
            type="link"
            onClick={() => {
              setCurrent(row);
              setResolution("dismiss");
              setNote("");
              setOpen(true);
            }}
          >
            处置
          </Button>
        ) : (
          <Typography.Text type="secondary">{row.resolution || "-"}</Typography.Text>
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
            { value: "pending", label: "待处理" },
            { value: "resolved", label: "已处置" },
            { value: "dismissed", label: "已驳回" },
            { value: "all", label: "全部" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      <Modal
        title="处置举报"
        open={open}
        onCancel={() => setOpen(false)}
        confirmLoading={!!actingId}
        onOk={async () => {
          if (!current) return;
          setActingId(current.id);
          try {
            await resolveReport(current.id, resolution, note || undefined);
            message.success("已处置");
            setOpen(false);
            load();
          } catch (err: unknown) {
            message.error(err instanceof Error ? err.message : "处置失败");
          } finally {
            setActingId(null);
          }
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            value={resolution}
            style={{ width: "100%" }}
            onChange={setResolution}
            options={RESOLUTION_OPTIONS}
          />
          <Input.TextArea
            rows={3}
            placeholder="管理员备注（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Space>
      </Modal>
    </>
  );
}

function MediaPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

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
      render: (_, row) =>
        row.audit_status === "pending" ? (
          <Space>
            <Button type="link" onClick={() => onReview(row.id, "approve")}>
              通过
            </Button>
            <Button type="link" danger onClick={() => onReview(row.id, "reject")}>
              驳回
            </Button>
          </Space>
        ) : (
          "-"
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
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
    </>
  );
}

function CommunityPanel() {
  const [items, setItems] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

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
      render: (_, row) =>
        row.status === "pending" ? (
          <Space>
            <Button type="link" onClick={() => onReview(row.id, "approve")}>
              通过
            </Button>
            <Button type="link" danger onClick={() => onReview(row.id, "reject")}>
              驳回
            </Button>
          </Space>
        ) : (
          "-"
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
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
    </>
  );
}

function ActivitiesPanel() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

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
      render: (_, row) =>
        row.status === "pending" ? (
          <Space>
            <Button type="link" onClick={() => onReview(row.id, "approve")}>
              通过
            </Button>
            <Button type="link" danger onClick={() => onReview(row.id, "reject")}>
              驳回
            </Button>
          </Space>
        ) : (
          "-"
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
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
    </>
  );
}
