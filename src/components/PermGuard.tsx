import type { ReactNode } from "react";
import { Result } from "antd";
import { useLocation } from "react-router-dom";
import { getAdmin, hasPerm } from "../auth/session";
import { menuByPath } from "../layouts/menu";

/** Block page content when leaf requires a perm the session lacks (not a login redirect). */
export default function PermGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const leaf = menuByPath(location.pathname);
  const admin = getAdmin();
  const perms = admin?.permissions;

  if (leaf.perm) {
    // Before profile loads, permissions may be undefined — do not 403 yet.
    if (perms === undefined) {
      return <>{children}</>;
    }
    if (admin?.role === "superadmin" || perms.includes("*") || hasPerm(leaf.perm)) {
      return <>{children}</>;
    }
    return <Result status="403" title="403" subTitle="当前账号没有访问此页面的权限。" />;
  }
  return <>{children}</>;
}
