import { useCallback, useEffect, useState } from "react";
import {
  Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  clubAction, fetchClubs, fetchGuilds, fetchMessageEvents, saveGuild,
  type ClubRow, type GuildRow, type MessageEventRow,
} from "../api/orgs";

const PAGE = 20;
const STATUS_COLOR: Record<string, string> = { active: "green", hidden: "orange", dissolved: "default" };
const STATUS_LABEL: Record<string, string> = { active: "正常", hidden: "已下架", dissolved: "已解散" };

function ClubsTab() {
  const [rows, setRows] = useState<ClubRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchClubs({ q: q || undefined, status, limit: PAGE, offset })
      .then((d) => { setRows(d.items || []); setTotal(d.total ?? 0); })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [q, status, offset]);
  useEffect(load, [load]);

  const act = (id: string, action: "hide" | "unhide" | "dissolve") =>
    clubAction(id, action)
      .then(() => { message.success("已处理"); load(); })
      .catch((e: Error) => message.error(e.message));

  const columns: ColumnsType<ClubRow> = [
    { title: "名称", dataIndex: "name", render: (v, r) => <>{v} {r.is_official && <Tag color="blue">官方</Tag>}</> },
    { title: "主题", dataIndex: "topic", width: 90 },
    { title: "城市", dataIndex: "city", width: 90 },
    { title: "成员", dataIndex: "member_count", width: 80 },
    { title: "创建者", dataIndex: "creator_name", width: 110, render: (v) => v || "-" },
    { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] || s}</Tag> },
    { title: "创建", dataIndex: "created_at", width: 180 },
    {
      title: "操作", width: 200,
      render: (_, r) => (
        <Can perm="club:write">
          <Space>
            {r.status === "active" && <Button size="small" onClick={() => act(r.id, "hide")}>下架</Button>}
            {r.status === "hidden" && <Button size="small" onClick={() => act(r.id, "unhide")}>恢复</Button>}
            {r.status !== "dissolved" && !r.is_official && (
              <Popconfirm title="解散后成员需重新加入，确认？" onConfirm={() => act(r.id, "dissolve")}>
                <Button size="small" danger>解散</Button>
              </Popconfirm>
            )}
          </Space>
        </Can>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder="名称 / 城市" allowClear onSearch={(v) => { setOffset(0); setQ(v); }} style={{ width: 220 }} />
        <Select value={status} style={{ width: 120 }} onChange={(v) => { setOffset(0); setStatus(v); }}
          options={[{ value: "all", label: "全部" }, { value: "active", label: "正常" }, { value: "hidden", label: "已下架" }, { value: "dissolved", label: "已解散" }]} />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table rowKey="id" size="middle" loading={loading} columns={columns} dataSource={rows}
        pagination={{ current: Math.floor(offset / PAGE) + 1, pageSize: PAGE, total, showSizeChanger: false, onChange: (p) => setOffset((p - 1) * PAGE) }} />
    </>
  );
}

function GuildsTab() {
  const [rows, setRows] = useState<GuildRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<GuildRow | "new" | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(() => {
    setLoading(true);
    fetchGuilds({ limit: PAGE, offset })
      .then((d) => { setRows(d.items || []); setTotal(d.total ?? 0); })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [offset]);
  useEffect(load, [load]);

  const openEdit = (g: GuildRow | "new") => {
    setEditing(g);
    form.resetFields();
    if (g !== "new") form.setFieldsValue({ ...g, price_yuan: Math.round(g.price_from_cents / 100), tags: g.tags.join(",") });
  };

  const submit = async () => {
    const v = await form.validateFields();
    const body = {
      name: v.name, specialty: v.specialty, city: v.city, summary: v.summary,
      tags: String(v.tags || "").split(/[,，]/).map((t: string) => t.trim()).filter(Boolean),
      price_from_cents: Math.round((v.price_yuan || 0) * 100),
      status: v.status || "active",
      owner_user_id: v.owner_user_id || undefined,
    };
    saveGuild(editing === "new" || !editing ? null : editing.id, body)
      .then(() => { message.success("已保存"); setEditing(null); load(); })
      .catch((e: Error) => message.error(e.message));
  };

  const columns: ColumnsType<GuildRow> = [
    { title: "工会", dataIndex: "name" },
    { title: "擅长", dataIndex: "specialty", width: 140 },
    { title: "城市", dataIndex: "city", width: 90 },
    { title: "陪玩数", dataIndex: "companion_count", width: 90 },
    { title: "周订单", dataIndex: "weekly_orders", width: 90 },
    { title: "起价", dataIndex: "price_from_cents", width: 90, render: (c: number) => `¥${Math.round(c / 100)}` },
    { title: "状态", dataIndex: "status", width: 90, render: (s: string) => <Tag color={s === "active" ? "green" : "orange"}>{s === "active" ? "正常" : "隐藏"}</Tag> },
    { title: "操作", width: 90, render: (_, g) => <Can perm="club:write"><Button size="small" onClick={() => openEdit(g)}>编辑</Button></Can> },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Can perm="club:write"><Button type="primary" onClick={() => openEdit("new")}>新建工会</Button></Can>
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows}
        pagination={{ current: Math.floor(offset / PAGE) + 1, pageSize: PAGE, total, showSizeChanger: false, onChange: (p) => setOffset((p - 1) * PAGE) }} />
      <Modal open={Boolean(editing)} title={editing === "new" ? "新建工会" : "编辑工会"} onCancel={() => setEditing(null)} onOk={submit} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input maxLength={40} /></Form.Item>
          <Form.Item name="specialty" label="擅长"><Input maxLength={80} /></Form.Item>
          <Form.Item name="city" label="城市"><Input maxLength={48} /></Form.Item>
          <Form.Item name="summary" label="简介"><Input.TextArea rows={3} maxLength={500} /></Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）"><Input /></Form.Item>
          <Form.Item name="price_yuan" label="起价（元）"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="owner_user_id" label="会长用户 ID（可选，用于工会群聊）"><Input /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select options={[{ value: "active", label: "正常" }, { value: "hidden", label: "隐藏" }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function MessageEventsTab() {
  const [rows, setRows] = useState<MessageEventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [kind, setKind] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const load = useCallback(() => {
    setLoading(true);
    fetchMessageEvents({ kind, limit: PAGE, offset })
      .then((d) => { setRows(d.items || []); setTotal(d.total ?? 0); })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [kind, offset]);
  useEffect(load, [load]);
  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select allowClear placeholder="类型" style={{ width: 120 }} value={kind} onChange={(v) => { setOffset(0); setKind(v); }}
          options={[{ value: "recall", label: "撤回" }, { value: "edit", label: "编辑" }]} />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table rowKey="id" loading={loading} dataSource={rows}
        columns={[
          { title: "类型", dataIndex: "kind", width: 80, render: (k: string) => <Tag color={k === "recall" ? "red" : "blue"}>{k === "recall" ? "撤回" : "编辑"}</Tag> },
          { title: "会话", dataIndex: "conversation_id", ellipsis: true },
          { title: "操作人", dataIndex: "actor_id", ellipsis: true },
          { title: "内容预览", dataIndex: "body_preview", ellipsis: true, render: (v) => v || "-" },
          { title: "原发送时间", dataIndex: "sent_at", width: 180 },
          { title: "操作时间", dataIndex: "created_at", width: 180 },
        ]}
        pagination={{ current: Math.floor(offset / PAGE) + 1, pageSize: PAGE, total, showSizeChanger: false, onChange: (p) => setOffset((p - 1) * PAGE) }} />
    </>
  );
}

export default function ClubsPage() {
  return (
    <PageShell title="俱乐部与工会" desc="俱乐部上下架 / 解散、工会维护、聊天撤回与编辑审计。">
      <Tabs
        items={[
          { key: "clubs", label: "俱乐部", children: <ClubsTab /> },
          { key: "guilds", label: "工会", children: <GuildsTab /> },
          { key: "events", label: "撤回 / 编辑审计", children: <MessageEventsTab /> },
        ]}
      />
    </PageShell>
  );
}
