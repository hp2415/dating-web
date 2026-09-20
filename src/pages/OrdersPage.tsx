import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Drawer, Input, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import { closeOrder, fetchOrder, fetchOrders, type OrderItem } from "../api/commerce";

export default function OrdersPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | undefined>();
  const [kind, setKind] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchOrders({ status, kind, q: q || undefined, limit, offset })
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total ?? data.page_info?.total ?? 0);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, kind, q, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<OrderItem> = [
    { title: "订单号", dataIndex: "order_no", width: 180 },
    { title: "类型", dataIndex: "kind", width: 140 },
    { title: "标题", dataIndex: "subject_title", ellipsis: true },
    {
      title: "应付",
      dataIndex: "payable_cents",
      width: 100,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (s: string) => <Tag>{s}</Tag>,
    },
    { title: "创建时间", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              try {
                setDetail(await fetchOrder(row.id));
              } catch (e) {
                message.error((e as Error).message);
              }
            }}
          >
            详情
          </Button>
          <Can perm="order:write">
            <Button
              size="small"
              danger
              disabled={["closed", "cancelled", "refunded"].includes(row.status)}
              onClick={() => {
                closeOrder(row.id)
                  .then(() => {
                    message.success("已关单");
                    load();
                  })
                  .catch((e: Error) => message.error(e.message));
              }}
            >
              关单
            </Button>
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <PageShell title="订单中心" desc="活动 / 陪玩 / 会员 / 充值统一订单。已接 /admin/v1/orders。">
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
      <Space wrap style={{ marginBottom: 12 }}>
        <Input.Search
          allowClear
          placeholder="订单号"
          style={{ width: 200 }}
          onSearch={(v) => {
            setOffset(0);
            setQ(v);
          }}
        />
        <Select
          allowClear
          placeholder="类型"
          style={{ width: 160 }}
          value={kind}
          onChange={(v) => {
            setOffset(0);
            setKind(v);
          }}
          options={[
            { value: "activity", label: "活动" },
            { value: "companion_booking", label: "陪玩" },
            { value: "membership", label: "会员" },
            { value: "wallet_topup", label: "充值" },
          ]}
        />
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
            { value: "pending_payment", label: "待支付" },
            { value: "paid", label: "已支付" },
            { value: "closed", label: "已关闭" },
            { value: "refunded", label: "已退款" },
            { value: "cancelled", label: "已取消" },
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
      />
      <Drawer
        title="订单详情"
        width={480}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(detail, null, 2)}</pre>
      </Drawer>
    </PageShell>
  );
}
