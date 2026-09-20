import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  message,
} from "antd";
import PageShell from "../components/PageShell";
import Can from "../components/Can";
import ProTable from "../components/ProTable";
import {
  fetchSmsConfig,
  fetchSmsLogs,
  testSendSms,
  updateSmsConfig,
  type SmsLogItem,
} from "../api/sms";

export default function SmsConfigPage() {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState<string | undefined>();
  const [phone, setPhone] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [form] = Form.useForm();
  const limit = 20;

  const configQuery = useQuery({
    queryKey: ["sms-config"],
    queryFn: fetchSmsConfig,
  });

  const logsQuery = useQuery({
    queryKey: ["sms-logs", phone, status, offset],
    queryFn: () =>
      fetchSmsLogs({
        phone: phone.trim() || undefined,
        status,
        limit,
        offset,
      }),
  });

  useEffect(() => {
    const d = configQuery.data;
    if (!d) return;
    form.setFieldsValue({
      provider: d.provider,
      allow_dev_code: d.allow_dev_code,
      daily_limit: d.daily_limit,
      send_interval_seconds: d.send_interval_seconds,
      whitelist: d.whitelist,
      sign_name: d.sign_name,
      template_code: d.template_code,
      access_key_id: "",
      access_key_secret: "",
    });
  }, [configQuery.data, form]);

  const config = configQuery.data;
  const logs = logsQuery.data?.items || [];
  const total = logsQuery.data?.total ?? 0;
  const stats = config?.stats_7d;

  return (
    <PageShell
      title="短信通道"
      desc="登录验证码通道配置、试发与近 7 天发送日志。真实通道 SDK 预留，默认 log。"
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="近 7 天总量" value={stats?.total ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="成功" value={stats?.sent ?? 0} valueStyle={{ color: "#3f8600" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="失败" value={stats?.failed ?? 0} valueStyle={{ color: "#cf1322" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={stats?.success_rate != null ? Math.round(stats.success_rate * 1000) / 10 : "—"}
              suffix={stats?.success_rate != null ? "%" : undefined}
            />
          </Card>
        </Col>
      </Row>

      <Card title="通道配置" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (v) => {
            try {
              const body: Record<string, unknown> = {
                allow_dev_code: v.allow_dev_code,
                daily_limit: v.daily_limit,
                send_interval_seconds: v.send_interval_seconds,
                whitelist: v.whitelist ?? "",
                sign_name: v.sign_name ?? "",
                template_code: v.template_code ?? "",
                provider: v.provider,
              };
              if (v.access_key_id) body.access_key_id = v.access_key_id;
              if (v.access_key_secret) body.access_key_secret = v.access_key_secret;
              const next = await updateSmsConfig(body);
              await queryClient.invalidateQueries({ queryKey: ["sms-config"] });
              message.success(
                next.restart_recommended ? "已保存（建议重启服务使 provider 生效）" : "已保存",
              );
              form.setFieldsValue({ access_key_id: "", access_key_secret: "" });
            } catch (e: unknown) {
              message.error(e instanceof Error ? e.message : "保存失败");
            }
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="provider" label="Provider">
                <Select
                  options={[
                    { value: "log", label: "log（仅写日志）" },
                    { value: "aliyun", label: "aliyun（预留）" },
                    { value: "tencent", label: "tencent（预留）" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allow_dev_code" label="允许开发码" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="就绪">
                <Tag color={config?.ready ? "green" : "orange"}>{config?.ready ? "ready" : "not ready"}</Tag>
                {config?.access_key_id_masked ? (
                  <span style={{ marginLeft: 8 }}>Key: {config.access_key_id_masked}</span>
                ) : null}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="daily_limit" label="日限额">
                <InputNumber min={1} max={500} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="send_interval_seconds" label="发送间隔（秒）">
                <InputNumber min={10} max={3600} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="whitelist" label="开发码白名单（逗号分隔）">
                <Input placeholder="13800138000,139..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sign_name" label="签名">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="template_code" label="模板码">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="access_key_id" label="AccessKey ID（留空不改）">
                <Input.Password placeholder="不回显，留空表示不修改" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="access_key_secret" label="AccessKey Secret（留空不改）">
                <Input.Password placeholder="不回显，留空表示不修改" />
              </Form.Item>
            </Col>
          </Row>
          <Can perm="config:write">
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Can>
        </Form>
        {config?.note ? (
          <div style={{ marginTop: 12, color: "rgba(0,0,0,0.45)" }}>{config.note}</div>
        ) : null}
      </Card>

      <Card title="试发" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            style={{ width: 200 }}
            placeholder="手机号"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
          />
          <Can perm="config:write">
            <Button
              onClick={() => {
                if (!testPhone.trim()) {
                  message.warning("请输入手机号");
                  return;
                }
                testSendSms(testPhone.trim())
                  .then(() => {
                    message.success("已触发发送（log 通道写日志）");
                    queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
                    queryClient.invalidateQueries({ queryKey: ["sms-config"] });
                  })
                  .catch((e: Error) => message.error(e.message));
              }}
            >
              试发验证码
            </Button>
          </Can>
        </Space>
      </Card>

      <Card title="发送日志">
        <ProTable<SmsLogItem>
          toolbar={
            <Space style={{ marginBottom: 12 }} wrap>
              <Input.Search
                allowClear
                placeholder="手机号片段"
                style={{ width: 200 }}
                onSearch={(v) => {
                  setPhone(v);
                  setOffset(0);
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
                  { value: "sent", label: "sent" },
                  { value: "failed", label: "failed" },
                ]}
              />
              <Button onClick={() => logsQuery.refetch()}>刷新</Button>
            </Space>
          }
          rowKey="id"
          loading={logsQuery.isFetching}
          dataSource={logs}
          columns={[
            { title: "手机", dataIndex: "phone_masked", width: 130 },
            { title: "场景", dataIndex: "scene", width: 90 },
            { title: "通道", dataIndex: "provider", width: 90 },
            {
              title: "状态",
              dataIndex: "status",
              width: 90,
              render: (s: string) => <Tag color={s === "sent" ? "green" : "red"}>{s}</Tag>,
            },
            { title: "错误", dataIndex: "error_message", ellipsis: true },
            { title: "时间", dataIndex: "created_at", width: 180 },
          ]}
          pagination={{
            current: Math.floor(offset / limit) + 1,
            pageSize: limit,
            total,
            onChange: (page) => setOffset((page - 1) * limit),
          }}
        />
      </Card>
    </PageShell>
  );
}
