import { api, unwrap } from "./http";

export type CompanionItem = {
  user_id: string;
  display_name?: string;
  service_type: string;
  specialty: string;
  intro: string;
  city?: string | null;
  status: string;
  order_count: number;
  rating_avg: number;
  rating_count: number;
  verified: boolean;
  reject_reason?: string | null;
};

export type BookingItem = {
  id: string;
  companion_id: string;
  buyer_id: string;
  amount_cents: number;
  amount_display?: string;
  status: string;
  scheduled_at?: string | null;
  created_at?: string | null;
};

export type BuddyIntentItem = {
  id: string;
  user_id: string;
  text: string;
  tags: string[];
  city?: string | null;
  active: boolean;
  updated_at?: string | null;
};

export function fetchCompanions(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/companions", { params }));
}

export function reviewCompanion(userId: string, action: "approve" | "reject", reason?: string) {
  return unwrap(api.post(`/admin/v1/companions/${userId}/review`, { action, reason }));
}

export function fetchBookings(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/bookings", { params }));
}

export function fetchBuddyIntents(params: { active?: boolean; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/buddy-intents", { params }));
}
