import { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tabs, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  adjustTrust,
  createSanction,
  fetchSanctions,
  fetchTrustEvents,
  fetchTrustScores,
  fetchVerifications,
  reviewVerification,
  revokeSanction,
  upsertSensitiveWord,
  fetchSensitiveWords,
  type SanctionItem,
  type SensitiveWordItem,
  type TrustEventItem,
  type TrustScoreItem,
  type VerificationItem,
} from "../api/trust";

export function TrustPage() {
  return (
    <PageShell title="信任档案" desc="私域分数与事件流。公开卡仅徽章+事实（客户端另有接口）。">
      <Tabs
        items={[
          { key: "scores", label: "分数榜", children: <ScoresPanel /> },
          { key: "events", label: "事件流", children: <EventsPanel /> },
          { key: "adjust", label: "人工加减分", children: <AdjustPanel /> },
        ]}
      />
    </PageShell>
  );
}

export function VerificationPage() {
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchVerifications({ status, limit, offset })
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

  const review = (id: string, action: "approve" | "reject") => {
    let reason = "";
    Modal.confirm({
      title: action === "approve" ? "通过认证？" : "驳回认证？",
      content:
        action === "reject" ? (
          <Input.TextArea rows={2} placeholder="原因码/说明" onChange={(e) => (reason = e.target.value)} />
        ) : (
          "将授予 photo_verified 徽章"
        ),
      onOk: () =>
        reviewVerification(id, action, reason || undefined)
          .then(() => {
            message.success("已处理");
            load();
          })
          .catch((e: Error) => message.error(e.message)),
    });
  };

  const columns: ColumnsType<VerificationItem> = [
    { title: "用户", dataIndex: "user_id", ellipsis: true },
    { title: "类型", dataIndex: "kind", width: 100 },
    { title: "相似度", dataIndex: "similarity", width: 100 },
    { title: "质量", dataIndex: "quality_score", width: 100 },
    { title: "状态", dataIndex: "status", width: 110, render: (s) => <Tag>{s}</Tag> },
    { title: "提交", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 160,
      render: (_, row) =>
        row.status === "pending" ? (
          <Can perm="verification:review">
            <Space>
              <Button size="small" type="primary" onClick={() => review(row.id, "approve")}>
                通过
              </Button>
              <Button size="small" danger onClick={() => review(row.id, "reject")}>
                驳回
              </Button>
            </Space>
          </Can>
        ) : null,
    },
  ];

  return (
    <PageShell title="真人认证" desc="端侧比对分审核；不上传影像。">
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
            { value: "approved", label: "已通过" },
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
    </PageShell>
  );
}

export function SanctionsPage() {
  const [items, setItems] = useState<SanctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchSanctions({ limit: 50, offset: 0 })
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      title="拉黑与限流"
      desc="处置台账 sanctions。封禁会同步账号状态。"
      extra={
        <Can perm="sanction:write">
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              Modal.confirm({
                title: "新增处置",
                width: 480,
                content: (
                  <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="user_id" label="用户 ID" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="kind" label="类型" initialValue="warn" rules={[{ required: true }]}>
                      <Select
                        options={[
                          { value: "warn", label: "警告" },
                          { value: "mute", label: "禁言" },
                          { value: "limit_publish", label: "限发" },
                          { value: "limit_trade", label: "限交易" },
                          { value: "ban", label: "封禁" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="reason" label="原因" rules={[{ required: true }]}>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Form>
                ),
                onOk: async () => {
                  const v = await form.validateFields();
                  await createSanction(v);
                  message.success("已处置");
                  load();
                },
              });
            }}
          >
            新增处置
          </Button>
        </Can>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "用户", dataIndex: "user_id", ellipsis: true },
          { title: "类型", dataIndex: "kind", width: 120 },
          { title: "原因", dataIndex: "reason", ellipsis: true },
          { title: "开始", dataIndex: "started_at", width: 180 },
          { title: "撤销", dataIndex: "revoked_at", width: 180 },
          {
            title: "操作",
            width: 100,
            render: (_, row) =>
              !row.revoked_at ? (
                <Can perm="sanction:write">
                  <Button
                    size="small"
                    onClick={() =>
                      revokeSanction(row.id, "提前解除")
                        .then(() => {
                          message.success("已撤销");
                          load();
                        })
                        .catch((e: Error) => message.error(e.message))
                    }
                  >
                    撤销
                  </Button>
                </Can>
              ) : null,
          },
        ]}
        pagination={false}
      />
    </PageShell>
  );
}

export function SensitiveWordsPage() {
  const [items, setItems] = useState<SensitiveWordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchSensitiveWords()
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      title="敏感词"
      desc="词库增删与动作（warn / block / review）。"
      extra={
        <Can perm="config:write">
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              Modal.confirm({
                title: "添加敏感词",
                content: (
                  <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="word" label="词" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="category" label="分类" initialValue="general">
                      <Input />
                    </Form.Item>
                    <Form.Item name="action" label="动作" initialValue="review">
                      <Select
                        options={[
                          { value: "warn", label: "告警" },
                          { value: "block", label: "拦截" },
                          { value: "review", label: "送审" },
                        ]}
                      />
                    </Form.Item>
                  </Form>
                ),
                onOk: async () => {
                  const v = await form.validateFields();
                  await upsertSensitiveWord(v);
                  message.success("已保存");
                  load();
                },
              });
            }}
          >
            添加
          </Button>
        </Can>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "词", dataIndex: "word" },
          { title: "分类", dataIndex: "category", width: 120 },
          { title: "动作", dataIndex: "action", width: 100 },
          {
            title: "启用",
            dataIndex: "enabled",
            width: 80,
            render: (v: boolean) => (v ? "是" : "否"),
          },
          { title: "命中", dataIndex: "hit_count", width: 80 },
        ]}
        pagination={false}
      />
    </PageShell>
  );
}

function ScoresPanel() {
  const [items, setItems] = useState<TrustScoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustScores({ limit: 50, offset: 0 })
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Table
      rowKey="user_id"
      loading={loading}
      dataSource={items}
      columns={[
        { title: "用户", dataIndex: "user_id", ellipsis: true },
        { title: "分数", dataIndex: "score", width: 90 },
        { title: "等级", dataIndex: "level", width: 120 },
        { title: "样本", dataIndex: "sample_size", width: 80 },
        {
          title: "置信",
          dataIndex: "confidence_low",
          width: 90,
          render: (v: boolean) => (v ? <Tag color="orange">低</Tag> : <Tag color="green">足</Tag>),
        },
      ]}
      pagination={false}
    />
  );
}

function EventsPanel() {
  const [items, setItems] = useState<TrustEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const load = () => {
    setLoading(true);
    fetchTrustEvents({ user_id: userId || undefined, limit: 50, offset: 0 })
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
          placeholder="用户 ID"
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
          { title: "域", dataIndex: "domain", width: 110 },
          { title: "事件", dataIndex: "name", width: 160 },
          { title: "值", dataIndex: "value", width: 80 },
          { title: "来源", dataIndex: "source", width: 90 },
          { title: "备注", dataIndex: "note", ellipsis: true },
          { title: "时间", dataIndex: "created_at", width: 180 },
        ]}
        pagination={false}
      />
    </>
  );
}

function AdjustPanel() {
  const [form] = Form.useForm();
  return (
    <Can perm="trust:write">
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 420 }}
        onFinish={(v) =>
          adjustTrust(v)
            .then(() => {
              message.success("已记账");
              form.resetFields();
            })
            .catch((e: Error) => message.error(e.message))
        }
      >
        <Form.Item name="user_id" label="用户 ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="value" label="分值变动" rules={[{ required: true }]} initialValue={1}>
          <InputNumber style={{ width: "100%" }} min={-100} max={100} />
        </Form.Item>
        <Form.Item name="note" label="原因" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="domain" label="域" initialValue="moderation">
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form>
    </Can>
  );
}
