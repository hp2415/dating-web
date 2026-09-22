import api, { ApiEnvelope } from "./client";

export type MetricPoint = {
  day: string;
  dau: number;
  new_users: number;
  activities_published: number;
  orders_paid: number;
  gmv_cents: number;
};

export type MetricTotals = {
  dau: number;
  new_users: number;
  activities_published: number;
  orders_paid: number;
  gmv_cents: number;
};

export type MetricsOverview = {
  days: number;
  from: string;
  to: string;
  series: MetricPoint[];
  totals: MetricTotals;
  previous: MetricTotals;
  change: Record<keyof MetricTotals, number | null>;
};

export type FunnelStep = {
  event: string;
  count: number;
};

export type MetricsFunnel = {
  name: string;
  from: string;
  to: string;
  steps: FunnelStep[];
};

async function unwrap<T>(path: string, params?: Record<string, string | number>) {
  const { data } = await api.get<ApiEnvelope<T>>(path, { params });
  if (data.code !== 0) {
    throw new Error(data.message || "加载失败");
  }
  return data.data;
}

export function fetchMetricsOverview(days = 7) {
  return unwrap<MetricsOverview>("/admin/v1/metrics/overview", { days });
}

export function fetchMetricsFunnel(from: string, to: string, name = "core") {
  return unwrap<MetricsFunnel>("/admin/v1/metrics/funnel", { name, from, to });
}

export async function rebuildMetrics(days = 7) {
  const { data } = await api.post<ApiEnvelope<{ rebuilt: number }>>("/admin/v1/metrics/rebuild", null, {
    params: { days },
  });
  if (data.code !== 0) {
    throw new Error(data.message || "生成统计失败");
  }
  return data.data;
}
