import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Descriptions,
  Drawer,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import {
  fetchUser,
  fetchUserActivities,
  fetchUserOrders,
  fetchUserSanctions,
  fetchUserSocial,
  fetchUserTrustEvents,
  fetchUsers,
  forceLogoutUser,
  resetUserAvatar,
  revealUserPhone,
  type AdminUserItem,
} from "../api/users";

export default function UsersPage() {
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [city, setCity] = useState("");
  const [detail, setDetail] = useState<AdminUserItem | null>(null);
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    fetchUsers({
      q: q.trim() || undefined,
      status,
      city: city.trim() || undefined,
      limit,
      offset,
    })
      .then((d: { items?: AdminUserItem[]; total?: number }) => {
        setItems(d.items || []);
        setTotal(d.total ?? 0);
      })
      .catch((e: Error) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [q, status, city, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<AdminUserItem> = [
    { title: "昵称", dataIndex: "display_name", ellipsis: true, render: (v) => v || "—" },
    { title: "UID", dataIndex: "public_uid", width: 110, render: (v) => v || "—" },
    { title: "手机", dataIndex: "phone_masked", width: 130 },
    { title: "城市", dataIndex: "city", width: 100, render: (v) => v || "—" },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (s) => <Tag color={s === "active" ? "green" : s === "banned" ? "red" : "default"}>{s}</Tag>,
    },
    {
      title: "资料",
      width: 90,
      render: (_, r) => `${r.completion_score ?? 0}%`,
    },
    { title: "注册", dataIndex: "created_at", width: 180 },
    {
      title: "操作",
      width: 100,
      render: (_, row) => (
        <Button size="small" type="link" onClick={() => openDetail(row.id)}>
          详情
        </Button>
      ),
    },
  ];

  const openDetail = (id: string) => {
    fetchUser(id)
      .then((d: AdminUserItem) => setDetail(d))
      .catch((e: Error) => message.error(e.message));
  };

  return (
    <PageShell title="用户列表" desc="按手机号 / UID / 昵称检索；详情含活动、订单、社交、信任与处置。">
      <Space wrap style={{ marginBottom: 12 }}>
        <Input.Search
          allowClear
          placeholder="手机号 / UID / 昵称"
          style={{ width: 240 }}
          onSearch={(v) => {
            setOffset(0);
            setQ(v);
          }}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 120 }}
          value={status}
          onChange={(v) => {
            setOffset(0);
            setStatus(v);
          }}
          options={[
            { value: "active", label: "active" },
            { value: "limited", label: "limited" },
            { value: "banned", label: "banned" },
            { value: "deleted", label: "deleted" },
          ]}
        />
        <Input
          allowClear
          placeholder="城市"
          style={{ width: 140 }}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onPressEnter={() => {
            setOffset(0);
            load();
          }}
        />
        <Button onClick={load}>刷新</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        columns={columns}
        pagination={{
          current: Math.floor(offset / limit) + 1,
          pageSize: limit,
          total,
          onChange: (page) => setOffset((page - 1) * limit),
        }}
      />
      <UserDetailDrawer
        user={detail}
        onClose={() => setDetail(null)}
        onRefresh={() => {
          if (detail) openDetail(detail.id);
          load();
        }}
      />
    </PageShell>
  );
}

function UserDetailDrawer({
  user,
  onClose,
  onRefresh,
}: {
  user: AdminUserItem | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [phone, setPhone] = useState<string | null>(null);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [social, setSocial] = useState<{ friend_count?: number; friends?: unknown[] }>({});
  const [trustEvents, setTrustEvents] = useState<unknown[]>([]);
  const [sanctions, setSanctions] = useState<unknown[]>([]);

  useEffect(() => {
    setPhone(null);
    if (!user) return;
    fetchUserActivities(user.id)
      .then((d: { items?: unknown[] }) => setActivities(d.items || []))
      .catch(() => setActivities([]));
    fetchUserOrders(user.id)
      .then((d: { items?: unknown[] }) => setOrders(d.items || []))
      .catch(() => setOrders([]));
    fetchUserSocial(user.id)
      .then((d: { friend_count?: number; friends?: unknown[] }) => setSocial(d || {}))
      .catch(() => setSocial({}));
    fetchUserTrustEvents(user.id)
      .then((d: { items?: unknown[] }) => setTrustEvents(d.items || []))
      .catch(() => setTrustEvents([]));
    fetchUserSanctions(user.id)
      .then((d: { items?: unknown[] }) => setSanctions(d.items || []))
      .catch(() => setSanctions([]));
  }, [user?.id]);

  return (
    <Drawer
      width={720}
      title={user ? `${user.display_name || "用户"} · ${user.public_uid || user.id.slice(0, 8)}` : "用户详情"}
      open={!!user}
      onClose={onClose}
      destroyOnClose
    >
      {user && (
        <>
          <Space style={{ marginBottom: 16 }} wrap>
            <Can perm="user:write">
              <Button
                onClick={() =>
                  revealUserPhone(user.id)
                    .then((d: { phone?: string }) => {
                      setPhone(d.phone || null);
                      message.success("已记录查看完整手机号");
                    })
                    .catch((e: Error) => message.error(e.message))
                }
              >
                查看完整手机号
              </Button>
              <Button
                danger
                onClick={() =>
                  forceLogoutUser(user.id)
                    .then(() => message.success("已强制下线"))
                    .catch((e: Error) => message.error(e.message))
                }
              >
                强制下线
              </Button>
              <Button
                onClick={() =>
                  resetUserAvatar(user.id)
                    .then(() => {
                      message.success("已重置头像");
                      onRefresh();
                    })
                    .catch((e: Error) => message.error(e.message))
                }
              >
                重置头像
              </Button>
            </Can>
          </Space>
          <Tabs
            items={[
              {
                key: "profile",
                label: "资料",
                children: (
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="手机">{phone || user.phone_masked}</Descriptions.Item>
                    <Descriptions.Item label="状态">{user.status}</Descriptions.Item>
                    <Descriptions.Item label="城市">{user.city || "—"}</Descriptions.Item>
                    <Descriptions.Item label="完善度">{user.completion_score ?? 0}%</Descriptions.Item>
                    <Descriptions.Item label="信任">
                      {user.trust_level || "—"} / {user.trust_score ?? "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="钱包余额">
                      ¥{((user.wallet_balance_cents ?? 0) / 100).toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="简介">{user.bio || "—"}</Descriptions.Item>
                    <Descriptions.Item label="标签">{(user.tags || []).join("、") || "—"}</Descriptions.Item>
                    <Descriptions.Item label="注册">{user.created_at || "—"}</Descriptions.Item>
                    <Descriptions.Item label="最近活跃">{user.last_active_at || "—"}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "activities",
                label: "活动",
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={activities as { id: string }[]}
                    columns={[
                      { title: "标题", dataIndex: "title" },
                      { title: "角色", dataIndex: "role", width: 80 },
                      { title: "状态", dataIndex: "status", width: 100 },
                      { title: "城市", dataIndex: "city", width: 100 },
                    ]}
                  />
                ),
              },
              {
                key: "orders",
                label: "订单与钱包",
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={orders as { id: string }[]}
                    columns={[
                      { title: "单号", dataIndex: "order_no", width: 140 },
                      { title: "类型", dataIndex: "kind", width: 100 },
                      { title: "标题", dataIndex: "subject_title", ellipsis: true },
                      {
                        title: "金额",
                        dataIndex: "payable_cents",
                        width: 90,
                        render: (v: number) => `¥${(v / 100).toFixed(2)}`,
                      },
                      { title: "状态", dataIndex: "status", width: 100 },
                    ]}
                  />
                ),
              },
              {
                key: "social",
                label: "社交",
                children: (
                  <>
                    <Typography.Paragraph>好友数：{social.friend_count ?? 0}</Typography.Paragraph>
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={(social.friends || []) as { id: string }[]}
                      columns={[
                        { title: "好友 ID", dataIndex: "friend_id" },
                        { title: "状态", dataIndex: "status", width: 100 },
                        { title: "备注", dataIndex: "remark" },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: "trust",
                label: "信任",
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={trustEvents as { id: string }[]}
                    columns={[
                      { title: "域", dataIndex: "domain", width: 100 },
                      { title: "事件", dataIndex: "name" },
                      { title: "分值", dataIndex: "value", width: 80 },
                      { title: "备注", dataIndex: "note", ellipsis: true },
                      { title: "时间", dataIndex: "created_at", width: 180 },
                    ]}
                  />
                ),
              },
              {
                key: "sanctions",
                label: "处置历史",
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={sanctions as { id: string }[]}
                    columns={[
                      { title: "类型", dataIndex: "kind", width: 100 },
                      { title: "原因", dataIndex: "reason" },
                      { title: "范围", dataIndex: "scope", width: 100 },
                      { title: "开始", dataIndex: "started_at", width: 180 },
                      { title: "撤销", dataIndex: "revoked_at", width: 180 },
                    ]}
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </Drawer>
  );
}
