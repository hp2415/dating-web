import api, { ApiEnvelope } from "./client";
import type { AdminInfo } from "../auth/session";

export type LoginResult = {
  access_token: string;
  token_type: string;
  expires_in: number;
  admin: AdminInfo;
};

export type MeResult = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  permissions: string[];
  last_login_at?: string | null;
};

export type DashboardSummary = {
  admin: string;
  role: string;
  metrics: {
    users_total: number;
    matches_today: number;
    reports_pending: number;
    moderation_pending: number;
    posts_pending?: number;
    media_pending?: number;
    activities_pending?: number;
  };
  notice: string;
};

export async function login(username: string, password: string) {
  const { data } = await api.post<ApiEnvelope<LoginResult>>("/admin/v1/auth/login", {
    username,
    password,
  });
  if (data.code !== 0) {
    throw new Error(data.message || "登录失败");
  }
  return data.data;
}

export async function fetchMe() {
  const { data } = await api.get<ApiEnvelope<MeResult>>("/admin/v1/auth/me");
  if (data.code !== 0) {
    throw new Error(data.message || "获取账号失败");
  }
  return data.data;
}

export async function fetchDashboard() {
  const { data } = await api.get<ApiEnvelope<DashboardSummary>>("/admin/v1/dashboard/summary");
  if (data.code !== 0) {
    throw new Error(data.message || "获取看板失败");
  }
  return data.data;
}
