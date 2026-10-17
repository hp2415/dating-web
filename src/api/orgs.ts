import { api, unwrap, type Paged } from "./http";

export type ClubRow = {
  id: string;
  name: string;
  topic: string;
  city: string;
  summary: string;
  tags: string[];
  member_count: number;
  weekly_active: number;
  is_official: boolean;
  creator_id?: string | null;
  creator_name?: string | null;
  status: "active" | "hidden" | "dissolved" | string;
  admin_note?: string | null;
  created_at?: string | null;
};

export type GuildRow = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  summary: string;
  tags: string[];
  companion_count: number;
  weekly_orders: number;
  price_from_cents: number;
  owner_user_id?: string | null;
  status: "active" | "hidden" | string;
};

export type GuildUpsert = Partial<{
  name: string;
  specialty: string;
  city: string;
  summary: string;
  tags: string[];
  price_from_cents: number;
  owner_user_id: string | null;
  status: "active" | "hidden";
}>;

export type MessageEventRow = {
  id: string;
  conversation_id: string;
  message_id: string;
  actor_id: string;
  kind: "recall" | "edit";
  sent_at?: string | null;
  body_preview?: string | null;
  created_at?: string | null;
};

export function fetchClubs(params: { q?: string; status?: string; topic?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<ClubRow>>(api.get("/admin/v1/clubs", { params }));
}

export function clubAction(id: string, action: "hide" | "unhide" | "dissolve", admin_note?: string) {
  return unwrap<ClubRow>(api.post(`/admin/v1/clubs/${id}/action`, { action, admin_note }));
}

export function fetchGuilds(params: { q?: string; status?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<GuildRow>>(api.get("/admin/v1/guilds", { params }));
}

export function saveGuild(id: string | null, body: GuildUpsert) {
  return id
    ? unwrap<GuildRow>(api.put(`/admin/v1/guilds/${id}`, body))
    : unwrap<GuildRow>(api.post("/admin/v1/guilds", body));
}

export function fetchMessageEvents(params: { conversation_id?: string; kind?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<MessageEventRow>>(api.get("/admin/v1/chat/message-events", { params }));
}
