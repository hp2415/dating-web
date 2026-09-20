import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Col, Row, Space, Table, Tag, Typography } from "antd";
import { PREVIEW_SPECS } from "../layouts/menu";

type Props = {
  menuKey: string;
};

export default function PreviewPage({ menuKey }: Props) {
  const spec = PREVIEW_SPECS[menuKey];
  if (!spec) {
    return <Alert type="warning" showIcon message={`未配置预览：${menuKey}`} />;
  }

  return (
    <Space className="w-full" direction="vertical" size={16}>
      <Card className="card-wrapper page-hero" bordered={false}>
        <div className="page-hero__row">
          <div>
            <Space size={8} align="center">
              <Typography.Title level={4} className="page-title">
                {spec.title}
              </Typography.Title>
              <Tag color={spec.status === "live" ? "processing" : "default"}>
                {spec.status === "live" ? "已接 API" : "预览占位"}
              </Tag>
            </Space>
            <Typography.Paragraph type="secondary" className="page-hero__blurb">
              {spec.blurb}
            </Typography.Paragraph>
            <Typography.Text type="secondary" className="page-hero__ref">
              iOS 对齐：{spec.iosRef}
            </Typography.Text>
          </div>
          <Space>
            {menuKey === "safety-reports" || menuKey === "community" || menuKey === "activities" ? (
              <Link to="/moderation">
                <Button type="primary">去内容审核</Button>
              </Link>
            ) : null}
            <Badge status="processing" text="Demo 可改" />
          </Space>
        </div>
      </Card>

      {spec.metrics?.length ? (
        <Row gutter={[16, 16]}>
          {spec.metrics.map((m) => (
            <Col key={m.label} xs={12} md={8} lg={6}>
              <Card className="card-wrapper metric-soft" bordered={false} size="small">
                <Typography.Text type="secondary">{m.label}</Typography.Text>
                <div className="metric-soft__value">{m.value}</div>
                {m.tip ? (
                  <Typography.Text type="secondary" className="metric-soft__tip">
                    {m.tip}
                  </Typography.Text>
                ) : null}
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}

      <Card className="card-wrapper" bordered={false} title="样例数据（演示）">
        <Table
          rowKey={(_, i) => String(i)}
          size="middle"
          pagination={false}
          columns={spec.columns.map((c) => ({
            title: c.title,
            dataIndex: c.dataIndex,
            width: c.width,
            ellipsis: true,
          }))}
          dataSource={spec.rows}
        />
      </Card>

      {spec.nextApis?.length ? (
        <Card className="card-wrapper" bordered={false} title="待接后端合同" size="small">
          <ul className="api-list">
            {spec.nextApis.map((api) => (
              <li key={api}>
                <code>{api}</code>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </Space>
  );
}
