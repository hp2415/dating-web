import { useCallback, useEffect, useState } from "react";
import { Button, DatePicker, Input, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import PageShell from "../components/PageShell";
import { fetchAuditLogs, type AuditLogItem } from "../api/audit";

const { RangePicker } = DatePicker;

export default function AuditLogsPage() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [adminId, setAdminId] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchAuditLogs({
      admin_id: adminId.trim() || undefined,
      action: action.trim() || undefined,
      target_type: targetType.trim() || undefined,
      from: range?.[0]?.format("YYYY-MM-DD"),
      to: range?.[1]?.format("YYYY-MM-DD"),
      limit,
      offset,
    })
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total ?? 0);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [adminId, action, targetType, range, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: "管理员",
      dataIndex: "admin_id",
      width: 160,
      ellipsis: true,
      render: (v) => v || "—",
    },
    { title: "动作", dataIndex: "action", width: 160, ellipsis: true },
    {
      title: "对象",
      key: "target",
      ellipsis: true,
      render: (_, row) =>
        [row.target_type, row.target_id].filter(Boolean).join(" · ") || "—",
    },
    { title: "时间", dataIndex: "created_at", width: 190 },
    {
      title: "详情",
      dataIndex: "detail",
      ellipsis: true,
      render: (detail: AuditLogItem["detail"]) =>
        detail && Object.keys(detail).length ? JSON.stringify(detail) : "—",
    },
  ];

  return (
    <PageShell title="审计日志" desc="运营操作审计；已接 GET /admin/v1/audit-logs。">
      <Space style={{ marginBottom: 12 }} wrap>
        <Input
          allowClear
          placeholder="管理员 ID"
          style={{ width: 200 }}
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
        />
        <Input
          allowClear
          placeholder="动作 action"
          style={{ width: 160 }}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <Input
          allowClear
          placeholder="对象类型 target_type"
          style={{ width: 180 }}
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
        />
        <RangePicker value={range} onChange={(v) => setRange(v)} />
        <Button
          type="primary"
          onClick={() => {
            if (offset === 0) load();
            else setOffset(0);
          }}
        >
          查询
        </Button>
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
