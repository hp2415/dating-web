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
import { fetchMe } from "../api/auth";
import { clearSession, getAdmin, hasPerm, patchAdmin, type AdminInfo } from "../auth/session";
import { useTheme } from "../theme/ThemeProvider";
import { APP_MENU_TREE, menuByPath, openKeysForPath, type AppMenuLeaf, type AppMenuNode } from "./menu";
import PageTabs from "./PageTabs";
import PermGuard from "../components/PermGuard";

const MOBILE_QUERY = "(max-width: 992px)";

function leafVisible(leaf: AppMenuLeaf, admin: AdminInfo | null): boolean {
  if (!leaf.perm) return true;
  const perms = admin?.permissions;
  // Not yet loaded from /me — keep menu usable (esp. superadmin demos).
  if (perms === undefined) return true;
  if (admin?.role === "superadmin" || perms.includes("*")) return true;
  return hasPerm(leaf.perm);
}

function filterMenuTree(tree: AppMenuNode[], admin: AdminInfo | null): AppMenuNode[] {
  const out: AppMenuNode[] = [];
  for (const node of tree) {
    if ("children" in node) {
      const children = node.children.filter((c) => leafVisible(c, admin));
      if (children.length) {
        out.push({ ...node, children });
      }
    } else if (leafVisible(node, admin)) {
      out.push(node);
    }
  }
  return out;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminInfo | null>(() => getAdmin());
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
    fetchMe()
      .then((me) => {
        const next = {
          display_name: me.display_name,
          role: me.role,
          permissions: me.permissions || [],
        };
        patchAdmin(next);
        setAdmin(getAdmin());
      })
      .catch(() => {
        /* keep cached profile */
        setAdmin(getAdmin());
      });
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

  const permKey = admin?.permissions?.join(",") ?? (admin?.permissions === undefined ? "undef" : "");
  const menuItems: MenuProps["items"] = useMemo(() => {
    const filtered = filterMenuTree(APP_MENU_TREE, admin);
    return filtered.map((node) => {
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
    });
  }, [admin, permKey, admin?.role]);

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
            <PermGuard>
              <Outlet />
            </PermGuard>
          </div>
        </main>

        <footer className="admin-footer">Spark Admin · 让一起玩，变得简单、自然、可信</footer>
      </div>
    </div>
  );
}
