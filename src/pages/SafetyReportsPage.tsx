import { useCallback, useEffect, useState } from "react";
import { Button, Descriptions, Drawer, Input, Select, Space, Table, Tag, Typography, message } from "antd";
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
  const [acting, setActing] = useState(false);
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

  const openDetail = (row: ReportItem) => {
    setCurrent(row);
    setResolution("dismiss");
    setNote("");
  };

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
      render: (_, row) => (
        <Button type="link" onClick={() => openDetail(row)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <PageShell title="举报处置" desc="用户举报工单；入口在「安全治理 · 举报处置」。">
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
        onRow={(row) => ({ onClick: () => openDetail(row), style: { cursor: "pointer" } })}
      />
      <Drawer
        width={520}
        title="举报详情"
        open={Boolean(current)}
        onClose={() => setCurrent(null)}
        destroyOnClose
      >
        {current && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="工单 ID">{current.id}</Descriptions.Item>
              <Descriptions.Item label="举报人">
                {current.reporter_name || current.reporter_id}
              </Descriptions.Item>
              <Descriptions.Item label="举报人 ID">{current.reporter_id}</Descriptions.Item>
              <Descriptions.Item label="被举报人">
                {current.target_name || current.target_user_id}
              </Descriptions.Item>
              <Descriptions.Item label="被举报人 ID">{current.target_user_id}</Descriptions.Item>
              <Descriptions.Item label="原因">
                {REASON_LABEL[current.reason] || current.reason}
              </Descriptions.Item>
              {current.detail ? (
                <Descriptions.Item label="说明">
                  <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                    {current.detail}
                  </Typography.Paragraph>
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="状态">{current.status}</Descriptions.Item>
              {current.resolution ? (
                <Descriptions.Item label="处置结果">{current.resolution}</Descriptions.Item>
              ) : null}
              {current.admin_note ? (
                <Descriptions.Item label="管理员备注">{current.admin_note}</Descriptions.Item>
              ) : null}
              <Descriptions.Item label="提交">{current.created_at}</Descriptions.Item>
              {current.resolved_at ? (
                <Descriptions.Item label="处理时间">{current.resolved_at}</Descriptions.Item>
              ) : null}
            </Descriptions>
            {current.status === "pending" ? (
              <Can perm="report:write">
                <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
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
                  <Button
                    type="primary"
                    loading={acting}
                    onClick={() => {
                      setActing(true);
                      resolveReport(current.id, resolution, note || undefined)
                        .then(() => {
                          message.success("已处置");
                          setCurrent(null);
                          load();
                        })
                        .catch((e: Error) => message.error(e.message))
                        .finally(() => setActing(false));
                    }}
                  >
                    提交处置
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
