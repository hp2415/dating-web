export type AdminInfo = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  is_active: boolean;
  /** From /admin/v1/auth/me; `*` = all */
  permissions?: string[];
};

const TOKEN_KEY = "spark_admin_token";
const ADMIN_KEY = "spark_admin_profile";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, admin: AdminInfo) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function patchAdmin(partial: Partial<AdminInfo>) {
  const current = getAdmin();
  if (!current) return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ ...current, ...partial }));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function getAdmin(): AdminInfo | null {
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminInfo;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}

export function hasPerm(perm: string): boolean {
  const admin = getAdmin();
  const perms = admin?.permissions || [];
  if (perms.includes("*") || perms.includes(perm)) return true;
  // Legacy sessions before permissions were persisted: superadmin can do all
  if ((!perms.length || perms.length === 0) && admin?.role === "superadmin") return true;
  return false;
}
