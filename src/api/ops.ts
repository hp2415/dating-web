import { api, unwrap } from "./http";

export type TaxonomyItem = {
  id: string;
  kind: string;
  code: string;
  parent_code?: string | null;
  name: string;
  icon?: string | null;
  sort_order: number;
  enabled: boolean;
  meta?: Record<string, unknown>;
};

export type ShelfItem = {
  id: string;
  title: string;
  subtitle: string;
  layout: string;
  rule_type: string;
  city_scope: string[];
  sort_order: number;
  enabled: boolean;
  items?: Array<{
    id: string;
    subject_kind: string;
    subject_id: string;
    sort_order: number;
    pinned: boolean;
  }>;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  audience: string;
  status: string;
  publish_at?: string | null;
};

export type FeedbackItem = {
  id: string;
  user_id: string;
  category: string;
  content: string;
  contact?: string | null;
  status: string;
  admin_reply?: string | null;
  created_at?: string | null;
};

export type CampaignItem = {
  id: string;
  title: string;
  body: string;
  status: string;
  sent_count: number;
  audience: Record<string, unknown>;
  created_at?: string | null;
};

export function fetchTaxonomies(kind?: string) {
  return unwrap(api.get("/admin/v1/taxonomies", { params: { kind } }));
}

export function upsertTaxonomy(body: Partial<TaxonomyItem> & { kind: string; code: string; name: string }) {
  return unwrap(api.post("/admin/v1/taxonomies", body));
}

export function updateTaxonomy(id: string, body: Partial<TaxonomyItem> & { kind: string; code: string; name: string }) {
  return unwrap(api.put(`/admin/v1/taxonomies/${id}`, body));
}

export function fetchShelves() {
  return unwrap(api.get("/admin/v1/discover-shelves"));
}

export function createShelf(body: {
  title: string;
  subtitle?: string;
  layout?: string;
  rule_type?: string;
  city_scope?: string[];
  sort_order?: number;
  enabled?: boolean;
}) {
  return unwrap(api.post("/admin/v1/discover-shelves", body));
}

export function updateShelf(id: string, body: Record<string, unknown>) {
  return unwrap(api.put(`/admin/v1/discover-shelves/${id}`, body));
}

export function addShelfItem(
  shelfId: string,
  body: { subject_kind: string; subject_id: string; sort_order?: number; pinned?: boolean },
) {
  return unwrap(api.post(`/admin/v1/discover-shelves/${shelfId}/items`, body));
}

export function fetchShelfItems(shelfId: string) {
  return unwrap(api.get(`/admin/v1/discover-shelves/${shelfId}/items`));
}

export function updateShelfItem(
  shelfId: string,
  itemId: string,
  body: { subject_kind: string; subject_id: string; sort_order?: number; pinned?: boolean },
) {
  return unwrap(api.put(`/admin/v1/discover-shelves/${shelfId}/items/${itemId}`, body));
}

export function deleteShelfItem(shelfId: string, itemId: string) {
  return unwrap(api.delete(`/admin/v1/discover-shelves/${shelfId}/items/${itemId}`));
}

export function fetchAnnouncements() {
  return unwrap(api.get("/admin/v1/announcements"));
}

export function createAnnouncement(body: { title: string; body?: string; pinned?: boolean; audience?: string }) {
  return unwrap(api.post("/admin/v1/announcements", body));
}

export function publishAnnouncement(id: string) {
  return unwrap(api.post(`/admin/v1/announcements/${id}/publish`));
}

export function fetchFeedbacks(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/feedbacks", { params }));
}

export function replyFeedback(id: string, reply: string) {
  return unwrap(api.post(`/admin/v1/feedbacks/${id}/reply`, { reply }));
}

export function fetchCampaigns() {
  return unwrap(api.get("/admin/v1/push-campaigns"));
}

export function createCampaign(body: { title: string; body?: string; deep_link?: string; audience?: Record<string, unknown> }) {
  return unwrap(api.post("/admin/v1/push-campaigns", body));
}

export function sendCampaign(id: string, audience?: Record<string, unknown>) {
  return unwrap(api.post(`/admin/v1/push-campaigns/${id}/send`, { audience }));
}
