import { Button, Card, Form, Input, Modal, Select, Space, Switch, Table, Tabs, Tag, Tooltip, message } from "antd";
import { useState } from "react";
import PageShell from "../components/PageShell";
import { getAdmin } from "../auth/session";
import {
  createAdmin,
  errorMessage,
  fetchAdmins,
  fetchRoles,
  updateAdmin,
  type AdminAccount,
} from "../api/analytics";
import { useLoader } from "./analytics/common";

export default function AdminAccountsPage() {
  const roles = useLoader(() => fetchRoles(), []);
  const admins = useLoader(() => fetchAdmins(), []);
  const me = getAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const roleOptions = (roles.data?.items || []).map((r) => ({ value: r.key, label: `${r.label}（${r.key}）` }));
  const labels = roles.data?.permission_labels || {};

  const submitCreate = async () => {
    const v = await createForm.validateFields();
    setSaving(true);
    try {
      await createAdmin(v);
      message.success("已创建");
      setCreateOpen(false);
      createForm.resetFields();
      admins.reload();
    } catch (e) {
      message.error(await errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!editing) return;
    const v = await editForm.validateFields();
    const body: Record<string, unknown> = {};
    if (v.display_name !== editing.display_name) body.display_name = v.display_name;
    if (v.role !== editing.role) body.role = v.role;
    if (v.is_active !== editing.is_active) body.is_active = v.is_active;
    if (v.new_password) body.new_password = v.new_password;
    if (!Object.keys(body).length) {
      setEditing(null);
      return;
    }
    setSaving(true);
    try {
      await updateAdmin(editing.id, body);
      message.success("已保存");
      setEditing(null);
      admins.reload();
    } catch (e) {
      message.error(await errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="管理员与角色"
      desc="账号增删改均写入审计日志；不能停用或降级最后一个超级管理员，也不能操作自己。"
      extra={<Button type="primary" onClick={() => setCreateOpen(true)}>新建管理员</Button>}
    >
      <Card>
        <Tabs
          items={[
            {
              key: "accounts",
              label: "管理员账号",
              children: (
                <Table
                  size="small"
                  rowKey="id"
                  loading={admins.loading}
                  dataSource={admins.data?.items || []}
                  pagination={false}
                  columns={[
                    { title: "账号", dataIndex: "username" },
                    { title: "姓名", dataIndex: "display_name", render: (v) => v || "—" },
                    { title: "角色", dataIndex: "role_label" },
                    { title: "状态", dataIndex: "is_active", width: 90, render: (v: boolean) => (v ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>) },
                    { title: "最近登录", dataIndex: "last_login_at", render: (v) => (v ? v.replace("T", " ").slice(0, 19) : "—") },
                    {
                      title: "操作",
                      width: 100,
                      render: (_, r) =>
                        r.id === me?.id ? (
                          <Tooltip title="不能修改自己的账号"><Button size="small" disabled>编辑</Button></Tooltip>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => {
                              setEditing(r);
                              editForm.setFieldsValue({ display_name: r.display_name, role: r.role, is_active: r.is_active, new_password: "" });
                            }}
                          >
                            编辑
                          </Button>
                        ),
                    },
                  ]}
                />
              ),
            },
            {
              key: "roles",
              label: "角色与权限",
              children: (
                <Table
                  size="small"
                  rowKey="key"
                  loading={roles.loading}
                  dataSource={roles.data?.items || []}
                  pagination={false}
                  columns={[
                    { title: "角色", width: 160, render: (_, r) => `${r.label}（${r.key}）` },
                    { title: "说明", dataIndex: "desc", width: 320 },
                    {
                      title: "权限",
                      render: (_, r) =>
                        r.permissions.includes("*") ? (
                          <Tag color="red">全部权限</Tag>
                        ) : (
                          <Space size={[4, 4]} wrap>
                            {r.permissions.map((p) => (
                              <Tooltip key={p} title={labels[p] || p}>
                                <Tag color={p.startsWith("analytics:") || p === "audit:read" || p === "admin:manage" ? "blue" : undefined}>{p}</Tag>
                              </Tooltip>
                            ))}
                          </Space>
                        ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal title="新建管理员" open={createOpen} okText="创建" confirmLoading={saving} onOk={submitCreate} onCancel={() => setCreateOpen(false)} destroyOnClose>
        <Form form={createForm} layout="vertical">
          <Form.Item name="username" label="账号" rules={[{ required: true, min: 3, max: 32 }]}><Input autoComplete="off" /></Form.Item>
          <Form.Item name="display_name" label="姓名"><Input maxLength={64} /></Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}><Select options={roleOptions} /></Form.Item>
          <Form.Item
            name="password"
            label="初始密码"
            extra="至少 10 位，需同时包含字母和数字。"
            rules={[{ required: true, min: 10, max: 72 }, { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: "需同时包含字母和数字" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`编辑 ${editing?.username ?? ""}`} open={!!editing} okText="保存" confirmLoading={saving} onOk={submitEdit} onCancel={() => setEditing(null)} destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item name="display_name" label="姓名"><Input maxLength={64} /></Form.Item>
          <Form.Item name="role" label="角色"><Select options={roleOptions} /></Form.Item>
          <Form.Item name="is_active" label="启用" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="new_password" label="重置密码" extra="留空则不修改；至少 10 位且含字母和数字。" rules={[{ min: 10, max: 72 }, { pattern: /^$|^(?=.*[A-Za-z])(?=.*\d).+$/, message: "需同时包含字母和数字" }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </PageShell>
  );
}
