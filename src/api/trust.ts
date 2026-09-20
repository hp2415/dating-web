import { api, unwrap } from "./http";

export type TrustScoreItem = {
  user_id: string;
  score: number;
  level: string;
  sample_size: number;
  confidence_low: boolean;
};

export type TrustEventItem = {
  id: string;
  domain: string;
  name: string;
  value: number;
  note: string;
  source: string;
  subject_user_id?: string | null;
  created_at?: string | null;
};

export type VerificationItem = {
  id: string;
  user_id: string;
  kind: string;
  status: string;
  similarity?: number | null;
  quality_score?: number | null;
  reject_reason?: string | null;
  created_at?: string | null;
};

export type SanctionItem = {
  id: string;
  user_id: string;
  kind: string;
  reason: string;
  scope: string;
  started_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
};

export type SensitiveWordItem = {
  id: string;
  word: string;
  category: string;
  action: string;
  enabled: boolean;
  hit_count: number;
};

export function fetchTrustScores(params: { limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/trust/scores", { params }));
}

export function fetchTrustEvents(params: { user_id?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/trust/events", { params }));
}

export function adjustTrust(body: { user_id: string; value: number; note: string; domain?: string }) {
  return unwrap(api.post("/admin/v1/trust/adjust", body));
}

export function fetchVerifications(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/verifications", { params }));
}

export function reviewVerification(id: string, action: "approve" | "reject", reason?: string) {
  return unwrap(api.post(`/admin/v1/verifications/${id}/review`, { action, reason }));
}

export function fetchSanctions(params: { user_id?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/sanctions", { params }));
}

export function createSanction(body: {
  user_id: string;
  kind: string;
  reason: string;
  scope?: string;
  expires_at?: string | null;
}) {
  return unwrap(api.post("/admin/v1/sanctions", body));
}

export function revokeSanction(id: string, reason?: string) {
  return unwrap(api.post(`/admin/v1/sanctions/${id}/revoke`, { reason }));
}

export function fetchSensitiveWords() {
  return unwrap(api.get("/admin/v1/sensitive-words"));
}

export function upsertSensitiveWord(body: {
  word: string;
  category?: string;
  action?: string;
  enabled?: boolean;
}) {
  return unwrap(api.post("/admin/v1/sensitive-words", body));
}
