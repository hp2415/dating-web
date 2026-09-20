import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, Tabs, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  fetchBookings,
  fetchBuddyIntents,
  fetchCompanions,
  reviewCompanion,
  type BookingItem,
  type BuddyIntentItem,
  type CompanionItem,
} from "../api/companion";

export default function CompanionsPage() {
  return (
    <PageShell title="陪玩（预约）" desc="入驻审核、预约单只读。已接 /admin/v1/companions|bookings。">
      <Tabs
        items={[
          { key: "review", label: "入驻审核", children: <CompanionsPanel /> },
          { key: "bookings", label: "预约单", children: <BookingsPanel /> },
        ]}
      />
    </PageShell>
  );
}

export function BuddyIntentsPage() {
  const [items, setItems] = useState<BuddyIntentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchBuddyIntents({ active: true, limit, offset })
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
    <PageShell title="同好（免费）" desc="「我也想找」UGC 列表，风险文本需人工抽检。">
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          onChange: (p) => setOffset((p - 1) * limit),
        }}
        columns={[
          { title: "用户", dataIndex: "user_id", width: 220, ellipsis: true },
          { title: "文案", dataIndex: "text", ellipsis: true },
          {
            title: "标签",
            dataIndex: "tags",
            width: 160,
            render: (tags: string[]) => (tags || []).map((t) => <Tag key={t}>{t}</Tag>),
          },
          { title: "城市", dataIndex: "city", width: 100 },
          { title: "更新", dataIndex: "updated_at", width: 180 },
        ]}
      />
    </PageShell>
  );
}

function CompanionsPanel() {
  const [items, setItems] = useState<CompanionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchCompanions({ status, limit, offset })
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

  const review = (userId: string, action: "approve" | "reject") => {
    let reason = "";
    Modal.confirm({
      title: action === "approve" ? "通过入驻？" : "驳回入驻？",
      content:
        action === "reject" ? (
          <Input.TextArea
            rows={3}
            placeholder="驳回原因"
            onChange={(e) => {
              reason = e.target.value;
            }}
          />
        ) : (
          "审核通过后可对外接单"
        ),
      onOk: () =>
        reviewCompanion(userId, action, reason || undefined)
          .then(() => {
            message.success("已处理");
            load();
          })
          .catch((e: Error) => message.error(e.message)),
    });
  };

  const columns: ColumnsType<CompanionItem> = [
    { title: "昵称", dataIndex: "display_name", width: 120 },
    { title: "擅长", dataIndex: "specialty", width: 140 },
    { title: "类型", dataIndex: "service_type", width: 100 },
    { title: "城市", dataIndex: "city", width: 100 },
    { title: "单量", dataIndex: "order_count", width: 80 },
    { title: "评分", dataIndex: "rating_avg", width: 80 },
    { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
    {
      title: "操作",
      width: 160,
      render: (_, row) =>
        row.status === "pending" ? (
          <Can perm="companion:review">
            <Space>
              <Button size="small" type="primary" onClick={() => review(row.user_id, "approve")}>
                通过
              </Button>
              <Button size="small" danger onClick={() => review(row.user_id, "reject")}>
                驳回
              </Button>
            </Space>
          </Can>
        ) : null,
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "pending", label: "待审" },
            { value: "active", label: "已通过" },
            { value: "rejected", label: "已驳回" },
            { value: "paused", label: "暂停" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="user_id"
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
    </>
  );
}

function BookingsPanel() {
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings({ limit: 50, offset: 0 })
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={[
        { title: "预约", dataIndex: "id", ellipsis: true },
        { title: "陪玩师", dataIndex: "companion_id", ellipsis: true },
        { title: "买家", dataIndex: "buyer_id", ellipsis: true },
        {
          title: "金额",
          dataIndex: "amount_cents",
          width: 100,
          render: (v: number, r) => r.amount_display || `¥${(v / 100).toFixed(2)}`,
        },
        { title: "状态", dataIndex: "status", width: 120, render: (s) => <Tag>{s}</Tag> },
        { title: "档期", dataIndex: "scheduled_at", width: 180 },
      ]}
      pagination={false}
    />
  );
}
