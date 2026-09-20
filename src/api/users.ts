import { api, unwrap } from "./http";

export type AdminUserItem = {
  id: string;
  public_uid?: string | null;
  phone_masked: string;
  phone?: string | null;
  status: string;
  discoverable?: boolean;
  profile_completed?: boolean;
  display_name: string;
  city: string;
  gender?: string;
  bio?: string;
  tags?: string[];
  completion_score?: number;
  avatar_media_id?: string | null;
  created_at?: string | null;
  last_active_at?: string | null;
  wallet_balance_cents?: number;
  trust_score?: number | null;
  trust_level?: string | null;
};

export function fetchUsers(params: {
  q?: string;
  status?: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  return unwrap(api.get("/admin/v1/users", { params }));
}

export function fetchUser(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}`));
}

export function revealUserPhone(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}/phone`));
}

export function fetchUserActivities(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}/activities`));
}

export function fetchUserOrders(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}/orders`));
}

export function fetchUserSocial(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}/social`));
}

export function fetchUserTrustEvents(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}/trust-events`));
}

export function fetchUserSanctions(id: string) {
  return unwrap(api.get(`/admin/v1/users/${id}/sanctions`));
}

export function forceLogoutUser(id: string) {
  return unwrap(api.post(`/admin/v1/users/${id}/force-logout`));
}

export function resetUserAvatar(id: string) {
  return unwrap(api.post(`/admin/v1/users/${id}/reset-avatar`));
}
