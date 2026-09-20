import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tabs, Tag, message } from "antd";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  createAnnouncement,
  createCampaign,
  createShelf,
  fetchAnnouncements,
  fetchCampaigns,
  fetchFeedbacks,
  fetchShelves,
  fetchTaxonomies,
  publishAnnouncement,
  replyFeedback,
  sendCampaign,
  upsertTaxonomy,
  type AnnouncementItem,
  type CampaignItem,
  type FeedbackItem,
  type ShelfItem,
  type TaxonomyItem,
} from "../api/ops";

export function TaxonomyPage() {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<string | undefined>("activity_category");
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchTaxonomies(kind)
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [kind]);

  return (
    <PageShell
      title="城市与兴趣"
      desc="taxonomies：活动分类 / 兴趣 / 城市 / 陪玩擅长。客户端改配置不用发版。"
      extra={
        <Can perm="config:write">
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ kind: kind || "activity_category", enabled: true, sort_order: 0 });
              Modal.confirm({
                title: "新增分类项",
                width: 480,
                content: (
                  <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="kind" label="类型" rules={[{ required: true }]}>
                      <Select
                        options={[
                          { value: "activity_category", label: "活动分类" },
                          { value: "interest", label: "兴趣" },
                          { value: "city", label: "城市" },
                          { value: "companion_specialty", label: "陪玩擅长" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="code" label="编码" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="sort_order" label="排序">
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item name="enabled" label="启用" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Form>
                ),
                onOk: async () => {
                  const v = await form.validateFields();
                  v.sort_order = Number(v.sort_order || 0);
                  await upsertTaxonomy(v);
                  message.success("已保存");
                  load();
                },
              });
            }}
          >
            新增
          </Button>
        </Can>
      }
    >
      <Space style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder="类型"
          style={{ width: 180 }}
          value={kind}
          onChange={setKind}
          options={[
            { value: "activity_category", label: "活动分类" },
            { value: "interest", label: "兴趣" },
            { value: "city", label: "城市" },
            { value: "companion_specialty", label: "陪玩擅长" },
          ]}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "类型", dataIndex: "kind", width: 160 },
          { title: "编码", dataIndex: "code", width: 140 },
          { title: "名称", dataIndex: "name" },
          { title: "排序", dataIndex: "sort_order", width: 80 },
          {
            title: "启用",
            dataIndex: "enabled",
            width: 80,
            render: (v: boolean) => (v ? "是" : "否"),
          },
        ]}
        pagination={false}
      />
    </PageShell>
  );
}

export function ShelvesPage() {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchShelves()
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      title="发现货架"
      desc="Hero / 轨 / 网格布局配置。规则引擎可视化后续迭代。"
      extra={
        <Can perm="config:write">
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ layout: "rail", rule_type: "manual", enabled: true, sort_order: 0 });
              Modal.confirm({
                title: "新建货架",
                content: (
                  <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="subtitle" label="副标题">
                      <Input />
                    </Form.Item>
                    <Form.Item name="layout" label="布局">
                      <Select
                        options={[
                          { value: "hero", label: "Hero" },
                          { value: "rail", label: "轨" },
                          { value: "grid", label: "网格" },
                          { value: "list", label: "列表" },
                        ]}
                      />
                    </Form.Item>
                  </Form>
                ),
                onOk: async () => {
                  const v = await form.validateFields();
                  await createShelf(v);
                  message.success("已创建");
                  load();
                },
              });
            }}
          >
            新建
          </Button>
        </Can>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "标题", dataIndex: "title" },
          { title: "布局", dataIndex: "layout", width: 100 },
          { title: "规则", dataIndex: "rule_type", width: 100 },
          {
            title: "城市",
            dataIndex: "city_scope",
            width: 160,
            render: (v: string[]) => (v || []).join(", ") || "全部",
          },
          {
            title: "启用",
            dataIndex: "enabled",
            width: 80,
            render: (v: boolean) => (v ? "是" : "否"),
          },
          {
            title: "条目",
            width: 80,
            render: (_, r) => (r.items || []).length,
          },
        ]}
        pagination={false}
      />
    </PageShell>
  );
}

export function PushPage() {
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchCampaigns()
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      title="通知推送"
      desc="推送任务 stub：发送时写入站内信（最多 100 人）。"
      extra={
        <Can perm="push:write">
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              Modal.confirm({
                title: "新建推送",
                content: (
                  <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="body" label="正文">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="deep_link" label="深链">
                      <Input placeholder="spark://..." />
                    </Form.Item>
                  </Form>
                ),
                onOk: async () => {
                  const v = await form.validateFields();
                  await createCampaign(v);
                  message.success("已创建");
                  load();
                },
              });
            }}
          >
            新建
          </Button>
        </Can>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "标题", dataIndex: "title" },
          { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
          { title: "已发", dataIndex: "sent_count", width: 80 },
          { title: "创建", dataIndex: "created_at", width: 180 },
          {
            title: "操作",
            width: 100,
            render: (_, row) =>
              row.status === "draft" || row.status === "scheduled" ? (
                <Can perm="push:write">
                  <Button
                    size="small"
                    type="primary"
                    onClick={() =>
                      Modal.confirm({
                        title: "确认发送？",
                        content: "将向受众写入站内信（演示通道）。",
                        onOk: () =>
                          sendCampaign(row.id)
                            .then(() => {
                              message.success("已发送");
                              load();
                            })
                            .catch((e: Error) => message.error(e.message)),
                      })
                    }
                  >
                    发送
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

export function AnnouncementsFeedbackPage() {
  return (
    <PageShell title="公告与反馈" desc="公告发布 + 意见反馈工单回复。">
      <Tabs
        items={[
          { key: "ann", label: "公告", children: <AnnouncementsPanel /> },
          { key: "fb", label: "反馈", children: <FeedbackPanel /> },
        ]}
      />
    </PageShell>
  );
}

function AnnouncementsPanel() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    fetchAnnouncements()
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Can perm="config:write">
        <Button
          type="primary"
          style={{ marginBottom: 12 }}
          onClick={() => {
            form.resetFields();
            Modal.confirm({
              title: "新建公告",
              content: (
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                  <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="body" label="正文">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Form>
              ),
              onOk: async () => {
                const v = await form.validateFields();
                await createAnnouncement(v);
                message.success("已创建");
                load();
              },
            });
          }}
        >
          新建公告
        </Button>
      </Can>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={[
          { title: "标题", dataIndex: "title" },
          { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
          {
            title: "置顶",
            dataIndex: "pinned",
            width: 80,
            render: (v: boolean) => (v ? "是" : "否"),
          },
          {
            title: "操作",
            width: 100,
            render: (_, row) =>
              row.status === "draft" ? (
                <Can perm="config:write">
                  <Button
                    size="small"
                    type="primary"
                    onClick={() =>
                      publishAnnouncement(row.id)
                        .then(() => {
                          message.success("已发布");
                          load();
                        })
                        .catch((e: Error) => message.error(e.message))
                    }
                  >
                    发布
                  </Button>
                </Can>
              ) : null,
          },
        ]}
        pagination={false}
      />
    </>
  );
}

function FeedbackPanel() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchFeedbacks({ limit: 50, offset: 0 })
      .then((d) => setItems(d.items || []))
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={items}
      columns={[
        { title: "用户", dataIndex: "user_id", width: 200, ellipsis: true },
        { title: "分类", dataIndex: "category", width: 100 },
        { title: "内容", dataIndex: "content", ellipsis: true },
        { title: "状态", dataIndex: "status", width: 100, render: (s) => <Tag>{s}</Tag> },
        {
          title: "操作",
          width: 100,
          render: (_, row) =>
            row.status === "open" ? (
              <Can perm="config:write">
                <Button
                  size="small"
                  onClick={() => {
                    let reply = "";
                    Modal.confirm({
                      title: "回复反馈",
                      content: (
                        <Input.TextArea rows={3} placeholder="回复内容" onChange={(e) => (reply = e.target.value)} />
                      ),
                      onOk: () =>
                        replyFeedback(row.id, reply)
                          .then(() => {
                            message.success("已回复");
                            load();
                          })
                          .catch((e: Error) => message.error(e.message)),
                    });
                  }}
                >
                  回复
                </Button>
              </Can>
            ) : (
              row.admin_reply || "—"
            ),
        },
      ]}
      pagination={false}
    />
  );
}
