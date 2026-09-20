import { api, unwrap } from "./http";

export type ConversationItem = {
  id: string;
  kind: string;
  title: string;
  im_conversation_id?: string | null;
  status: string;
  member_count?: number;
  created_at?: string | null;
};

export function fetchConversations(params: { kind?: string; q?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/conversations", { params }));
}

export function fetchConversation(id: string) {
  return unwrap(api.get(`/admin/v1/conversations/${id}`));
}
