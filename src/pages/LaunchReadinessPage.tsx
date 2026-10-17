import { Alert, Button, Card, Descriptions, Space, Table, Tag } from "antd";
import PageShell from "../components/PageShell";
import { fetchProviders } from "../api/analytics";
import { useLoader } from "./analytics/common";

const PROVIDER_LABELS: Record<string, string> = {
  sms: "短信",
  im: "即时通讯",
  push: "厂商推送",
  identity: "实名 / 人脸核验",
  map: "地图 / 地理编码",
  content_safety: "内容安全",
  payment: "支付",
  storage: "媒体存储",
};

const LEVEL = {
  ok: { color: "green", text: "通过" },
  warn: { color: "orange", text: "建议" },
  critical: { color: "red", text: "阻塞" },
} as const;

export default function LaunchReadinessPage() {
  const { data, loading, reload } = useLoader(() => fetchProviders(), []);
  const checks = data?.checks || [];
  const blockers = checks.filter((c) => c.level === "critical").length;
  const warns = checks.filter((c) => c.level === "warn").length;
  const providers = Object.entries(data || {}).filter(([k, v]) => k in PROVIDER_LABELS && typeof v === "object" && v);

  return (
    <PageShell
      title="上线检查"
      desc="第三方通道接入状态与上线前必须处理的配置；完整清单见仓库 docs/LAUNCH_BLOCKERS.md。"
      extra={<Button onClick={reload}>刷新</Button>}
    >
      {data ? (
        <Alert
          style={{ marginBottom: 16 }}
          showIcon
          type={blockers ? "error" : warns ? "warning" : "success"}
          message={blockers ? `${blockers} 项阻塞上线，${warns} 项建议处理` : warns ? `无阻塞项，${warns} 项建议处理` : "全部通过"}
          description={`当前环境 APP_ENV=${data.env}`}
        />
      ) : null}
      <Card title="检查项" loading={loading} style={{ marginBottom: 16 }}>
        <Table
          size="small"
          rowKey="key"
          pagination={false}
          dataSource={[...checks].sort((a, b) => Object.keys(LEVEL).indexOf(b.level) - Object.keys(LEVEL).indexOf(a.level))}
          columns={[
            { title: "级别", dataIndex: "level", width: 90, render: (l: keyof typeof LEVEL) => <Tag color={LEVEL[l].color}>{LEVEL[l].text}</Tag> },
            { title: "项", dataIndex: "key", width: 180 },
            { title: "说明", dataIndex: "message" },
          ]}
        />
      </Card>
      <Card title="通道状态" loading={loading}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {providers.map(([k, v]) => (
            <Descriptions key={k} size="small" bordered column={4} title={PROVIDER_LABELS[k]}>
              {Object.entries(v as Record<string, unknown>).map(([ik, iv]) => (
                <Descriptions.Item key={ik} label={ik}>
                  {typeof iv === "boolean" ? <Tag color={iv ? "green" : "default"}>{String(iv)}</Tag> : String(iv ?? "—")}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ))}
        </Space>
      </Card>
    </PageShell>
  );
}
