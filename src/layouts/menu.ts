import {
  AuditOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ComponentType } from "react";

export type AppMenuItem = {
  key: string;
  path: string;
  title: string;
  icon: ComponentType;
  closable: boolean;
};

export const APP_MENUS: AppMenuItem[] = [
  { key: "dashboard", path: "/", title: "工作台", icon: DashboardOutlined, closable: false },
  { key: "users", path: "/users", title: "用户管理", icon: TeamOutlined, closable: true },
  { key: "moderation", path: "/moderation", title: "内容审核", icon: AuditOutlined, closable: true },
  { key: "settings", path: "/settings", title: "系统设置", icon: SettingOutlined, closable: true },
];

export function menuByPath(pathname: string): AppMenuItem {
  return APP_MENUS.find((item) =>
    item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
  ) || APP_MENUS[0];
}
