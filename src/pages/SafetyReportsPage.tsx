import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import { fetchReports, resolveReport, type ReportItem } from "../api/moderation";

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

export default function SafetyReportsPage() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [current, setCurrent] = useState<ReportItem | null>(null);
  const [resolution, setResolution] = useState("dismiss");
  const [note, setNote] = useState("");
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchReports(status, limit, offset)
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

  const columns: ColumnsType<ReportItem> = [
    { title: "举报人", dataIndex: "reporter_name", width: 120, render: (v, r) => v || r.reporter_id },
    { title: "对象", dataIndex: "target_name", width: 120, render: (v, r) => v || r.target_user_id },
    {
      title: "原因",
      dataIndex: "reason",
      width: 110,
      render: (r: string) => REASON_LABEL[r] || r,
    },
    { title: "详情", dataIndex: "detail", ellipsis: true },
    { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
    { title: "提交", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 100,
      render: (_, row) =>
        row.status === "pending" ? (
          <Can perm="report:write">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setCurrent(row);
                setResolution("dismiss");
                setNote("");
              }}
            >
              处置
            </Button>
          </Can>
        ) : (
          row.resolution || "—"
        ),
    },
  ];

  return (
    <PageShell title="举报处置" desc="用户举报工单；与「内容审核 · 举报工单」同源 API。">
      <Space style={{ marginBottom: 12 }}>
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "pending", label: "待处理" },
            { value: "resolved", label: "已处理" },
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
          onChange: (p) => setOffset((p - 1) * limit),
        }}
      />
      <Modal
        open={Boolean(current)}
        title="处置举报"
        onCancel={() => setCurrent(null)}
        onOk={() => {
          if (!current) return;
          resolveReport(current.id, resolution, note || undefined)
            .then(() => {
              message.success("已处置");
              setCurrent(null);
              load();
            })
            .catch((e: Error) => message.error(e.message));
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            style={{ width: "100%" }}
            value={resolution}
            onChange={setResolution}
            options={RESOLUTION_OPTIONS}
          />
          <Input.TextArea
            rows={3}
            placeholder="备注（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Space>
      </Modal>
    </PageShell>
  );
}
