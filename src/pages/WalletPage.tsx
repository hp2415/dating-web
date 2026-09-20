import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Input, Modal, Select, Space, Table, Tabs, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  fetchRefunds,
  fetchReconciliation,
  fetchWalletLedger,
  processRefund,
  type LedgerItem,
  type RefundItem,
} from "../api/commerce";

export default function WalletPage() {
  return (
    <PageShell title="钱包与退款" desc="退款工单、钱包流水与对账概览。">
      <Tabs
        items={[
          { key: "refunds", label: "退款工单", children: <RefundsPanel /> },
          { key: "ledger", label: "钱包流水", children: <LedgerPanel /> },
          { key: "recon", label: "对账", children: <ReconPanel /> },
        ]}
      />
    </PageShell>
  );
}

function RefundsPanel() {
  const [items, setItems] = useState<RefundItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | undefined>("submitted");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchRefunds({ status, limit, offset })
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

  const act = (id: string, action: "complete" | "reject") => {
    let note = "";
    Modal.confirm({
      title: action === "complete" ? "确认完成退款？" : "确认驳回退款？",
      content: (
        <Input.TextArea
          rows={3}
          placeholder="备注（可选）"
          onChange={(e) => {
            note = e.target.value;
          }}
        />
      ),
      onOk: () =>
        processRefund(id, action, note || undefined)
          .then(() => {
            message.success("已处理");
            load();
          })
          .catch((e: Error) => message.error(e.message)),
    });
  };

  const columns: ColumnsType<RefundItem> = [
    { title: "退款单", dataIndex: "id", width: 220, ellipsis: true },
    { title: "订单", dataIndex: "order_id", width: 220, ellipsis: true },
    {
      title: "金额",
      dataIndex: "amount_cents",
      width: 100,
      render: (v: number, r) => r.amount_display || `¥${(v / 100).toFixed(2)}`,
    },
    { title: "原因", dataIndex: "reason", ellipsis: true },
    { title: "状态", dataIndex: "status", width: 110, render: (s) => <Tag>{s}</Tag> },
    {
      title: "操作",
      width: 160,
      render: (_, row) =>
        ["submitted", "processing"].includes(row.status) ? (
          <Can perm="order:refund">
            <Space>
              <Button size="small" type="primary" onClick={() => act(row.id, "complete")}>
                完成
              </Button>
              <Button size="small" danger onClick={() => act(row.id, "reject")}>
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
          allowClear
          placeholder="状态"
          style={{ width: 160 }}
          value={status}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "submitted", label: "已提交" },
            { value: "processing", label: "处理中" },
            { value: "completed", label: "已完成" },
            { value: "rejected", label: "已驳回" },
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
    </>
  );
}

function LedgerPanel() {
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const load = () => {
    setLoading(true);
    fetchWalletLedger({ user_id: userId || undefined, limit: 50, offset: 0 })
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Input
          placeholder="用户 ID（可选）"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: 280 }}
        />
        <Button onClick={load}>查询</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "用户", dataIndex: "user_id", ellipsis: true },
          { title: "类型", dataIndex: "kind", width: 140 },
          { title: "标题", dataIndex: "title" },
          {
            title: "变动",
            dataIndex: "amount_cents",
            width: 100,
            render: (v: number) => `¥${(v / 100).toFixed(2)}`,
          },
          {
            title: "余额后",
            dataIndex: "balance_after_cents",
            width: 100,
            render: (v: number) => `¥${(v / 100).toFixed(2)}`,
          },
          { title: "时间", dataIndex: "created_at", width: 180 },
        ]}
        pagination={false}
      />
    </>
  );
}

function ReconPanel() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReconciliation()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <Alert type="error" showIcon message={error} />;
  return <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(data, null, 2)}</pre>;
}
