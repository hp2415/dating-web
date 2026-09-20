import { Button, Card, Result } from "antd";
import { Link } from "react-router-dom";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card className="card-wrapper" bordered={false}>
      <Result
        status="info"
        title={title}
        subTitle="骨架页已预留，业务接口将在后续里程碑接入。"
        extra={
          <Link to="/">
            <Button type="primary" shape="round">
              返回工作台
            </Button>
          </Link>
        }
      />
    </Card>
  );
}
