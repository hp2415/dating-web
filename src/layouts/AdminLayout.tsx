import { Layout, Menu, Typography, Button, theme } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  AuditOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getAdmin } from "../auth/session";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = getAdmin();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selected = location.pathname.startsWith("/users")
    ? "users"
    : location.pathname.startsWith("/moderation")
      ? "moderation"
      : location.pathname.startsWith("/settings")
        ? "settings"
        : "dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth={64} theme="light">
        <div style={{ padding: "20px 16px" }}>
          <Typography.Title level={4} style={{ margin: 0, color: "#e11d48" }}>
            Spark
          </Typography.Title>
          <Typography.Text type="secondary">运营后台</Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: <Link to="/">工作台</Link> },
            { key: "users", icon: <TeamOutlined />, label: <Link to="/users">用户管理</Link> },
            {
              key: "moderation",
              icon: <AuditOutlined />,
              label: <Link to="/moderation">内容审核</Link>,
            },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: <Link to="/settings">系统设置</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 24,
          }}
        >
          <Typography.Text>
            {admin?.display_name || admin?.username || "管理员"} · {admin?.role}
          </Typography.Text>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              clearSession();
              navigate("/login", { replace: true });
            }}
          >
            退出
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <div
            style={{
              background: colorBgContainer,
              borderRadius: 16,
              padding: 24,
              minHeight: 420,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
