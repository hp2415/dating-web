import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ReloadOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Dropdown, Menu, Modal } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import SparkLogo from "../components/SparkLogo";
import { clearSession, getAdmin } from "../auth/session";
import { useTheme } from "../theme/ThemeProvider";
import { APP_MENU_TREE, menuByPath, openKeysForPath } from "./menu";
import PageTabs from "./PageTabs";

const MOBILE_QUERY = "(max-width: 992px)";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = getAdmin();
  const { darkMode, toggleScheme } = useTheme();
  const current = menuByPath(location.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [fullscreen, setFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [openKeys, setOpenKeys] = useState<string[]>(() => openKeysForPath(location.pathname));

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      setIsMobile(media.matches);
      setCollapsed(media.matches);
    };
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!collapsed || isMobile) {
      setOpenKeys(openKeysForPath(location.pathname));
    }
  }, [location.pathname, collapsed, isMobile]);

  const siderWidth = collapsed ? 64 : 232;

  const logout = () => {
    Modal.confirm({
      title: "提示",
      content: "确认退出登录？",
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        clearSession();
        navigate("/login", { replace: true });
      },
    });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      APP_MENU_TREE.map((node) => {
        if ("children" in node) {
          return {
            key: node.key,
            icon: <node.icon />,
            label: node.title,
            children: node.children.map((child) => ({
              key: child.key,
              icon: <child.icon />,
              label: <Link to={child.path}>{child.title}</Link>,
            })),
          };
        }
        return {
          key: node.key,
          icon: <node.icon />,
          label: <Link to={node.path}>{node.title}</Link>,
        };
      }),
    [],
  );

  const breadcrumbItems = [
    { title: <Link to="/">首页</Link> },
    ...(current.path === "/" ? [] : [{ title: current.title }]),
  ];

  return (
    <div
      className={`admin-shell${isMobile ? " is-mobile" : ""}${collapsed ? " is-collapsed" : ""}`}
      style={{ ["--admin-sider-width"]: `${isMobile ? 0 : siderWidth}px` } as CSSProperties}
    >
      {isMobile && !collapsed ? (
        <button type="button" className="admin-mask" aria-label="关闭菜单" onClick={() => setCollapsed(true)} />
      ) : null}

      <aside className={`admin-sider${collapsed ? " is-collapsed" : ""}`}>
        <Link to="/" className="admin-logo">
          <SparkLogo className="admin-logo__mark" />
          {!collapsed ? (
            <span className="admin-logo__text">
              <strong>Spark</strong>
              <em>找搭子运营</em>
            </span>
          ) : null}
        </Link>
        <div className="admin-menu-wrap">
          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[current.key]}
            openKeys={collapsed && !isMobile ? [] : openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            inlineCollapsed={collapsed && !isMobile}
            items={menuItems}
            className="admin-menu"
            onClick={() => {
              if (isMobile) setCollapsed(true);
            }}
          />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <Button
            type="text"
            className="admin-icon-btn"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            title={collapsed ? "展开菜单" : "收起菜单"}
            onClick={() => setCollapsed((v) => !v)}
          />
          <Breadcrumb className="admin-breadcrumb" items={breadcrumbItems} />
          <div className="admin-header__actions">
            <Button
              type="text"
              className="admin-icon-btn"
              icon={<ReloadOutlined />}
              title="刷新页面"
              onClick={() => setReloadKey((n) => n + 1)}
            />
            <Button
              type="text"
              className="admin-icon-btn"
              icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              title={fullscreen ? "退出全屏" : "全屏"}
              onClick={toggleFullscreen}
            />
            <Button
              type="text"
              className="admin-icon-btn"
              icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              title={darkMode ? "切换浅色" : "切换深色"}
              onClick={toggleScheme}
            />
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "退出登录",
                    onClick: logout,
                  },
                ],
              }}
            >
              <button type="button" className="admin-user">
                <span className="admin-user__avatar">
                  {(admin?.display_name || admin?.username || "管").slice(0, 1)}
                </span>
                <span className="admin-user__name">{admin?.display_name || admin?.username || "管理员"}</span>
              </button>
            </Dropdown>
          </div>
        </header>

        <div className="admin-tabs">
          <PageTabs />
        </div>

        <main className="admin-content">
          <div className="page-enter" key={`${location.pathname}-${reloadKey}`}>
            <Outlet />
          </div>
        </main>

        <footer className="admin-footer">Spark Admin · 让一起玩，变得简单、自然、可信</footer>
      </div>
    </div>
  );
}
