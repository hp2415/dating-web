import { Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/auth";
import { isLoggedIn, setSession } from "../auth/session";
import SparkLogo from "../components/SparkLogo";
import WaveBg from "../components/WaveBg";
import { PRIMARY, palette } from "../theme/color";
import { useTheme } from "../theme/ThemeProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { darkMode, toggleScheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<{ username: string; password: string }>();

  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const data = await login(values.username, values.password);
      setSession(data.access_token, data.admin);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        "登录失败";
      form.setFields([{ name: "password", errors: [msg] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <WaveBg themeColor={darkMode ? palette(PRIMARY, 600) : PRIMARY} />
      <Card className="login-card" bordered={false}>
        <header className="login-header">
          <SparkLogo className="login-logo" />
          <Typography.Title level={3} className="login-title">
            Spark Admin
          </Typography.Title>
          <Button type="text" size="small" onClick={toggleScheme}>
            {darkMode ? "浅色" : "深色"}
          </Button>
        </header>
        <Typography.Title level={4} className="login-subtitle">
          账号密码登录
        </Typography.Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: "admin", password: "Admin@123456", remember: true }}
        >
          <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <div className="login-row">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Typography.Text type="secondary">默认账号已预置</Typography.Text>
          </div>
          <Button type="primary" htmlType="submit" block size="large" shape="round" loading={loading}>
            确认
          </Button>
        </Form>
      </Card>
    </div>
  );
}
