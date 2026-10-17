import { Alert, Button, Card, DatePicker, Form, Input, Modal, Space, Table, Tabs, Tag, message } from "antd";
import { useMemo, useState } from "react";
import PageShell from "../../components/PageShell";
import Can from "../../components/Can";
import { hasPerm } from "../../auth/session";
import {
  errorMessage,
  exportEvents,
  fetchAnalyticsCatalog,
  lookupEvents,
  type EventQuery,
  type EventRow,
} from "../../api/analytics";
import { defaultRange, toParams, useLoader, type DayRange } from "./common";

const { RangePicker } = DatePicker;

function Lookup() {
  const [form] = Form.useForm();
  const [range, setRange] = useState<DayRange>(defaultRange(1));
  const [rows, setRows] = useState<EventRow[]>([]);
  const [masked, setMasked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [exporting, setExporting] = useState(false);
  const canPii = hasPerm("analytics:pii");

  const query = (): EventQuery => {
    const v = form.getFieldsValue();
    const clean: Record<string, string> = {};
    for (const [k, val] of Object.entries(v)) if (typeof val === "string" && val.trim()) clean[k] = val.trim();
    return { ...clean, ...toParams(range) };
  };
  const hasFilter = () => {
    const q = query() as Record<string, unknown>;
    return ["user_id", "anon_id", "session_id", "event_name", "object_id"].some((k) => q[k]);
  };

  const search = async () => {
    if (!hasFilter()) {
      message.warning("请至少填写一个筛选条件（用户 / 设备 / 会话 / 事件 / 对象）");
      return;
    }
    setLoading(true);
    try {
      const d = await lookupEvents({ ...query(), limit: 200 });
      setRows(d.items);
      setMasked(d.masked);
      setSearched(true);
    } catch (e) {
      message.error(await errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doExport = async () => {
    if (reason.trim().length < 5) {
      message.warning("请填写导出用途（至少 5 个字）");
      return;
    }
    setExporting(true);
    try {
      const r = await exportEvents({ ...query(), reason: reason.trim() });
      message.success(`已导出 ${r.rows} 行${r.truncated ? "（已达行数上限被截断）" : ""}`);
      setExportOpen(false);
      setReason("");
    } catch (e) {
      message.error(await errorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="每次查询与导出都会写入审计日志。"
        description={
          canPii
            ? "你的角色可查看明文用户标识，并可按用户 ID 查询，请仅用于排障与合规需要。"
            : "你的角色看到的用户 / 设备标识为脱敏伪名（同一结果内一致，无法反查）；不能按用户 ID 查询。"
        }
      />
      <Form form={form} layout="inline" style={{ rowGap: 8, marginBottom: 12 }}>
        {canPii ? (
          <Form.Item name="user_id"><Input allowClear placeholder="用户 ID (UUID)" style={{ width: 280 }} /></Form.Item>
        ) : null}
        <Form.Item name="anon_id"><Input allowClear placeholder="设备 anon_id" style={{ width: 200 }} /></Form.Item>
        <Form.Item name="session_id"><Input allowClear placeholder="会话 session_id" style={{ width: 200 }} /></Form.Item>
        <Form.Item name="event_name"><Input allowClear placeholder="事件名 如 item.exposed" style={{ width: 200 }} /></Form.Item>
        <Form.Item name="screen"><Input allowClear placeholder="页面" style={{ width: 140 }} /></Form.Item>
        <Form.Item name="object_id"><Input allowClear placeholder="对象 ID" style={{ width: 200 }} /></Form.Item>
        <Form.Item>
          <RangePicker allowClear={false} value={range} onChange={(v) => v?.[0] && v?.[1] && setRange([v[0], v[1]])} />
        </Form.Item>
        <Space>
          <Button type="primary" loading={loading} onClick={search}>查询</Button>
          <Can perm="analytics:export">
            <Button onClick={() => (hasFilter() ? setExportOpen(true) : message.warning("请先填写筛选条件"))}>导出 CSV</Button>
          </Can>
        </Space>
      </Form>
      <Table
        size="small"
        rowKey="id"
        loading={loading}
        dataSource={rows}
        locale={{ emptyText: searched ? "无匹配事件" : "填写条件后查询" }}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1100 }}
        columns={[
          { title: "接收时间", dataIndex: "received_at", width: 190, render: (v: string) => v.replace("T", " ").slice(0, 19) },
          { title: "事件", dataIndex: "event_name", width: 200 },
          { title: masked ? "用户（脱敏）" : "用户", dataIndex: "user_id", width: 150, ellipsis: true, render: (v) => v || "—" },
          { title: masked ? "设备（脱敏）" : "设备", dataIndex: "anon_id", width: 130, ellipsis: true },
          { title: "页面", dataIndex: "screen", width: 120 },
          { title: "对象", width: 180, ellipsis: true, render: (_, r) => (r.object_id ? `${r.object_type}:${r.object_id}` : "—") },
          { title: "版本", dataIndex: "app_version", width: 90 },
          { title: "属性", dataIndex: "props", ellipsis: true, render: (p) => (p && Object.keys(p).length ? JSON.stringify(p) : "—") },
        ]}
      />
      <Modal
        title="导出事件 CSV"
        open={exportOpen}
        okText="导出"
        confirmLoading={exporting}
        onOk={doExport}
        onCancel={() => setExportOpen(false)}
      >
        <p>
          将按当前筛选条件导出（{masked ? "用户 / 设备标识已脱敏" : "含明文标识"}）。用途将与导出条件一并写入审计日志。
        </p>
        <Input.TextArea rows={3} maxLength={200} showCount placeholder="导出用途（必填，至少 5 个字）" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </>
  );
}

function Catalog() {
  const { data, loading } = useLoader(() => fetchAnalyticsCatalog(), []);
  const [kw, setKw] = useState("");
  const events = useMemo(
    () => (data?.events || []).filter((e) => !kw || e.name.includes(kw) || e.desc.includes(kw)),
    [data, kw],
  );
  return (
    <>
      <Input.Search allowClear placeholder="搜索事件名 / 说明" style={{ width: 280, marginBottom: 12 }} onSearch={setKw} />
      <Table
        size="small"
        rowKey="name"
        loading={loading}
        dataSource={events}
        pagination={{ pageSize: 20 }}
        columns={[
          { title: "事件", dataIndex: "name", width: 240 },
          { title: "类别", dataIndex: "category", width: 100 },
          { title: "说明", dataIndex: "desc" },
          { title: "对象", dataIndex: "object_type", width: 100, render: (v) => v || "—" },
          { title: "阶段", dataIndex: "stage", width: 100, render: (v) => (v ? <Tag>{v}</Tag> : "—") },
          { title: "属性", dataIndex: "props", render: (p: Record<string, string>) => Object.entries(p || {}).map(([k, t]) => `${k}:${t}`).join("，") || "—" },
        ]}
      />
    </>
  );
}

export default function AnalyticsEventsPage() {
  return (
    <PageShell title="事件明细与目录" desc="按用户 / 设备 / 会话排查埋点；导出需填写用途并留痕。事件目录与 docs/ANALYTICS_EVENTS.md 同源。">
      <Card>
        <Tabs
          items={[
            { key: "lookup", label: "事件查询 / 导出", children: <Lookup /> },
            { key: "catalog", label: "事件目录", children: <Catalog /> },
          ]}
        />
      </Card>
    </PageShell>
  );
}
