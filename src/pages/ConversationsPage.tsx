import { useCallback, useEffect, useState } from "react";
import { Button, Drawer, Input, Select, Space, Table, Tabs, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import {
  fetchCalls,
  fetchConversation,
  fetchConversations,
  fetchFriendships,
  fetchMessageRequests,
  fetchTransfers,
  type CallItem,
  type ConversationItem,
  type FriendshipItem,
  type MessageRequestItem,
  type TransferItem,
} from "../api/messaging";

export default function ConversationsPage() {
  return (
    <PageShell title="消息关系" desc="会话 / 好友 / 打招呼 / 转账 / 通话只读。消息体在云 IM。">
      <Tabs
        items={[
          { key: "conv", label: "会话", children: <ConversationsPanel /> },
          { key: "friends", label: "好友", children: <FriendshipsPanel /> },
          { key: "requests", label: "打招呼", children: <MessageRequestsPanel /> },
          { key: "transfers", label: "转账", children: <TransfersPanel /> },
          { key: "calls", label: "通话", children: <CallsPanel /> },
        ]}
      />
    </PageShell>
  );
}

function ConversationsPanel() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [detail, setDetail] = useState<unknown>(null);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchConversations({ kind, q: q || undefined, limit, offset })
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total ?? 0);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [kind, q, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<ConversationItem> = [
    { title: "标题", dataIndex: "title", ellipsis: true },
    { title: "类型", dataIndex: "kind", width: 100 },
    { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
    { title: "成员", dataIndex: "member_count", width: 80 },
    { title: "最近消息", dataIndex: "last_message_preview", ellipsis: true },
    { title: "创建", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 90,
      render: (_, row) => (
        <Button
          size="small"
          onClick={() =>
            fetchConversation(row.id)
              .then(setDetail)
              .catch((e: Error) => message.error(e.message))
          }
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          allowClear
          placeholder="类型"
          style={{ width: 140 }}
          value={kind}
          onChange={(v) => {
            setOffset(0);
            setKind(v);
          }}
          options={[
            { value: "direct", label: "单聊" },
            { value: "group", label: "群聊" },
            { value: "activity", label: "活动群" },
          ]}
        />
        <Input.Search
          allowClear
          placeholder="标题 / IM id"
          style={{ width: 200 }}
          onSearch={(v) => {
            setOffset(0);
            setQ(v);
          }}
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
      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} width={520} title="会话详情">
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(detail, null, 2)}</pre>
      </Drawer>
    </>
  );
}

function FriendshipsPanel() {
  const [items, setItems] = useState<FriendshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchFriendships({ limit, offset })
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total ?? 0);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [offset]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={[
        { title: "用户", dataIndex: "user_id", ellipsis: true },
        { title: "好友", dataIndex: "friend_id", ellipsis: true },
        { title: "备注", dataIndex: "remark", width: 120 },
        { title: "分组", dataIndex: "group_name", width: 100 },
        { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
        { title: "创建", dataIndex: "created_at", width: 180 },
      ]}
      pagination={{
        current: Math.floor(offset / limit) + 1,
        pageSize: limit,
        total,
        onChange: (p) => setOffset((p - 1) * limit),
      }}
    />
  );
}

function MessageRequestsPanel() {
  const [items, setItems] = useState<MessageRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | undefined>("pending");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchMessageRequests({ status, limit, offset })
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

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          value={status}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "pending", label: "待处理" },
            { value: "accepted", label: "已接受" },
            { value: "rejected", label: "已拒绝" },
            { value: "expired", label: "已过期" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "来自", dataIndex: "from_user_id", ellipsis: true },
          { title: "发给", dataIndex: "to_user_id", ellipsis: true },
          { title: "预览", dataIndex: "preview_text", ellipsis: true },
          { title: "来源", dataIndex: "source", width: 100 },
          { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
          { title: "时间", dataIndex: "created_at", width: 180 },
        ]}
        pagination={{
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          onChange: (p) => setOffset((p - 1) * limit),
        }}
      />
    </>
  );
}

function TransfersPanel() {
  const [items, setItems] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | undefined>();
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchTransfers({ status, limit, offset })
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

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          value={status}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "pending", label: "待确认" },
            { value: "completed", label: "已完成" },
            { value: "cancelled", label: "已取消" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "付款方", dataIndex: "from_user_id", ellipsis: true },
          { title: "收款方", dataIndex: "to_user_id", ellipsis: true },
          {
            title: "金额",
            dataIndex: "amount_cents",
            width: 100,
            render: (v: number) => `¥${(v / 100).toFixed(2)}`,
          },
          { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
          { title: "时间", dataIndex: "created_at", width: 180 },
        ]}
        pagination={{
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          onChange: (p) => setOffset((p - 1) * limit),
        }}
      />
    </>
  );
}

function CallsPanel() {
  const [items, setItems] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | undefined>();
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchCalls({ status, limit, offset })
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

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          value={status}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "ringing", label: "振铃" },
            { value: "active", label: "通话中" },
            { value: "ended", label: "已结束" },
            { value: "missed", label: "未接" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "主叫", dataIndex: "caller_id", ellipsis: true },
          { title: "被叫", dataIndex: "callee_id", ellipsis: true },
          { title: "类型", dataIndex: "kind", width: 90 },
          { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
          { title: "开始", dataIndex: "started_at", width: 180 },
          { title: "结束", dataIndex: "ended_at", width: 180 },
        ]}
        pagination={{
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          onChange: (p) => setOffset((p - 1) * limit),
        }}
      />
    </>
  );
}
