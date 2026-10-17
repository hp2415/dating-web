import axios from "axios";
import { api, unwrap } from "./http";

export type RangeParams = { from?: string; to?: string };

export type OverviewPoint = {
  day: string;
  dau: number;
  wau: number;
  mau: number;
  sessions: number;
  avg_session_seconds: number;
  new_devices: number;
  retention: Record<string, number | null>;
};

export type AnalyticsOverview = {
  days: number;
  series: OverviewPoint[];
  latest: OverviewPoint | null;
  stickiness: number | null;
};

export type FunnelResult = {
  funnel: string;
  label: string;
  from: string;
  to: string;
  steps: Array<{
    index: number;
    event: string;
    object_type?: string | null;
    users: number;
    rate_from_prev: number | null;
    rate_from_first: number | null;
  }>;
};

export type UsageItem = {
  event: string;
  category: string;
  desc: string;
  events: number;
  avg_daily_users: number;
  peak_daily_users: number;
  sessions: number;
};

export type PageItem = { screen: string; views: number; avg_daily_users: number; avg_dwell_ms: number | null };

export type ObjectItem = {
  object_id: string;
  title?: string | null;
  exposures: number;
  exposed_users: number;
  clicks: number;
  details: number;
  conversions: number;
  paid: number;
  ctr: number | null;
  conversion_rate: number | null;
};

export type PerfItem = {
  metric: string;
  app_version: string;
  n: number;
  avg_ms: number | null;
  p50_ms: number | null;
  p90_ms: number | null;
  p99_ms: number | null;
};

export type ErrorItem = { event: string; key: string; app_version: string; count: number; devices: number };

export type CatalogEvent = {
  name: string;
  category: string;
  desc: string;
  props: Record<string, string>;
  stage?: string | null;
  object_type?: string | null;
};

export type EventRow = {
  id: number;
  event_id: string;
  event_name: string;
  user_id?: string | null;
  anon_id?: string | null;
  session_id?: string | null;
  screen?: string | null;
  object_type?: string | null;
  object_id?: string | null;
  duration_ms?: number | null;
  props?: Record<string, unknown>;
  app_version?: string | null;
  platform?: string | null;
  network_type?: string | null;
  occurred_at: string;
  received_at: string;
  skew_ms?: number | null;
};

export type EventQuery = RangeParams & {
  user_id?: string;
  anon_id?: string;
  session_id?: string;
  event_name?: string;
  screen?: string;
  object_id?: string;
};

const BASE = "/admin/v1/analytics";

export function fetchAnalyticsOverview(days = 14) {
  return unwrap<AnalyticsOverview>(api.get(`${BASE}/overview`, { params: { days } }));
}
export function fetchAnalyticsFunnel(name: string, range: RangeParams) {
  return unwrap<FunnelResult>(api.get(`${BASE}/funnel`, { params: { name, ...range } }));
}
export function fetchAnalyticsUsage(range: RangeParams) {
  return unwrap<{ items: UsageItem[] }>(api.get(`${BASE}/usage`, { params: range }));
}
export function fetchAnalyticsPages(range: RangeParams) {
  return unwrap<{ items: PageItem[] }>(api.get(`${BASE}/pages`, { params: range }));
}
export function fetchAnalyticsObjects(object_type: string, order: string, range: RangeParams) {
  return unwrap<{ items: ObjectItem[]; totals: Record<string, number> }>(
    api.get(`${BASE}/objects`, { params: { object_type, order, ...range } }),
  );
}
export function fetchAnalyticsPerf(range: RangeParams) {
  return unwrap<{ items: PerfItem[]; jank: Array<{ day: string; app_version: string; jank_pct: number }> }>(
    api.get(`${BASE}/perf`, { params: range }),
  );
}
export function fetchAnalyticsErrors(range: RangeParams) {
  return unwrap<{ items: ErrorItem[] }>(api.get(`${BASE}/errors`, { params: range }));
}
export function fetchAnalyticsCatalog() {
  return unwrap<{
    events: CatalogEvent[];
    funnels: Array<{ key: string; label: string; steps: Array<{ event: string; object_type?: string | null }> }>;
    object_types: string[];
  }>(api.get(`${BASE}/catalog`));
}
export function rebuildAnalytics(days: number) {
  return unwrap<Record<string, unknown>>(api.post(`${BASE}/rebuild`, null, { params: { days } }));
}
export function lookupEvents(q: EventQuery & { limit?: number; offset?: number }) {
  return unwrap<{ items: EventRow[]; masked: boolean; limit: number; offset: number }>(
    api.get(`${BASE}/events`, { params: q }),
  );
}

/** Downloads the CSV through the authenticated client (a plain <a href> would carry no token). */
export async function exportEvents(q: EventQuery & { reason: string }) {
  const res = await api.get(`${BASE}/events/export`, { params: q, responseType: "blob", timeout: 120000 });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  const cd = String(res.headers["content-disposition"] || "");
  a.download = /filename="?([^";]+)"?/.exec(cd)?.[1] || "events.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { rows: Number(res.headers["x-export-rows"] || 0), truncated: res.headers["x-export-truncated"] === "1" };
}

/** Turns an axios failure (incl. blob error bodies) into the server's message. */
export async function errorMessage(e: unknown): Promise<string> {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as unknown;
    if (data instanceof Blob) {
      try {
        return (JSON.parse(await data.text()) as { message?: string }).message || e.message;
      } catch {
        return e.message;
      }
    }
    return (data as { message?: string } | undefined)?.message || e.message;
  }
  return e instanceof Error ? e.message : "请求失败";
}

// ── accounts / roles / providers ────────────────────────────
export type RoleInfo = { key: string; label: string; desc: string; permissions: string[] };
export type AdminAccount = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  role_label: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string | null;
};
export function fetchRoles() {
  return unwrap<{ items: RoleInfo[]; permission_labels: Record<string, string> }>(api.get("/admin/v1/roles"));
}
export function fetchAdmins() {
  return unwrap<{ items: AdminAccount[]; total: number }>(api.get("/admin/v1/admins"));
}
export function createAdmin(body: { username: string; password: string; display_name?: string; role: string }) {
  return unwrap<AdminAccount>(api.post("/admin/v1/admins", body));
}
export function updateAdmin(
  id: string,
  body: { display_name?: string; role?: string; is_active?: boolean; new_password?: string },
) {
  return unwrap<AdminAccount>(api.put(`/admin/v1/admins/${id}`, body));
}

export type ProviderStatus = {
  env: string;
  checks: Array<{ key: string; level: "ok" | "warn" | "critical"; message: string }>;
  [k: string]: unknown;
};
export function fetchProviders() {
  return unwrap<ProviderStatus>(api.get("/admin/v1/system/providers"));
}
