import { api, unwrap, type Paged } from "./http";

export type AuditLogItem = {
  id: string;
  admin_id?: string | null;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  detail?: Record<string, unknown>;
  ip?: string | null;
  created_at?: string | null;
};

export type AuditLogQuery = {
  admin_id?: string;
  action?: string;
  target_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export function fetchAuditLogs(params: AuditLogQuery = {}): Promise<Paged<AuditLogItem>> {
  return unwrap(api.get("/admin/v1/audit-logs", { params }));
}
