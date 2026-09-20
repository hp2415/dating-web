import { api, unwrap, type Paged } from "./http";

export type ConversationItem = {
  id: string;
  kind: string;
  title: string;
  im_conversation_id?: string | null;
  owner_id?: string | null;
  status: string;
  member_count?: number;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  created_at?: string | null;
};

export type FriendshipItem = {
  id: string;
  user_id: string;
  friend_id: string;
  remark?: string | null;
  group_name?: string | null;
  status: string;
  created_at?: string | null;
};

export type MessageRequestItem = {
  id: string;
  conversation_id: string;
  from_user_id: string;
  to_user_id: string;
  preview_text?: string | null;
  source?: string | null;
  status: string;
  created_at?: string | null;
};

export type TransferItem = {
  id: string;
  conversation_id?: string | null;
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
  status: string;
  created_at?: string | null;
};

export type CallItem = {
  id: string;
  conversation_id?: string | null;
  caller_id: string;
  callee_id: string;
  kind: string;
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
};

export function fetchConversations(params: {
  kind?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  return unwrap<Paged<ConversationItem>>(api.get("/admin/v1/conversations", { params }));
}

export function fetchConversation(id: string) {
  return unwrap<{ conversation: ConversationItem; members: Array<Record<string, unknown>> }>(
    api.get(`/admin/v1/conversations/${id}`),
  );
}

export function fetchFriendships(params: { user_id?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<FriendshipItem>>(api.get("/admin/v1/friendships", { params }));
}

export function fetchMessageRequests(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<MessageRequestItem>>(api.get("/admin/v1/message-requests", { params }));
}

export function fetchTransfers(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<TransferItem>>(api.get("/admin/v1/transfers", { params }));
}

export function fetchCalls(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap<Paged<CallItem>>(api.get("/admin/v1/calls", { params }));
}
