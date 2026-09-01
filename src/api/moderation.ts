import api, { ApiEnvelope } from "./client";

export type ReportItem = {
  id: string;
  reporter_id: string;
  reporter_name?: string | null;
  target_user_id: string;
  target_name?: string | null;
  reason: string;
  detail?: string | null;
  status: string;
  resolution?: string | null;
  admin_note?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

export type MediaItem = {
  id: string;
  owner_id: string;
  owner_name?: string | null;
  media_type: string;
  url: string;
  audit_status: string;
  created_at: string;
};

export type Paged<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (data.code !== 0) {
    throw new Error(data.message || "请求失败");
  }
  return data.data;
}

export function fetchReports(status = "pending", limit = 50, offset = 0) {
  return unwrap(
    api.get<ApiEnvelope<Paged<ReportItem>>>("/admin/v1/reports", {
      params: { status, limit, offset },
    }),
  );
}

export function resolveReport(id: string, resolution: string, admin_note?: string) {
  return unwrap(
    api.post<ApiEnvelope<ReportItem>>(`/admin/v1/reports/${id}/resolve`, {
      resolution,
      admin_note,
    }),
  );
}

export function fetchMedia(audit_status = "pending", limit = 50, offset = 0) {
  return unwrap(
    api.get<ApiEnvelope<Paged<MediaItem>>>("/admin/v1/media", {
      params: { audit_status, limit, offset },
    }),
  );
}

export function reviewMedia(id: string, action: "approve" | "reject", admin_note?: string) {
  return unwrap(
    api.post<ApiEnvelope<{ id: string; audit_status: string; action: string }>>(
      `/admin/v1/media/${id}/review`,
      { action, admin_note },
    ),
  );
}

export type CommunityPostItem = {
  id: string;
  author_id: string;
  author_name?: string | null;
  content: string;
  media: Array<{ type: string; url?: string; media_id?: string | null }>;
  status: string;
  like_count: number;
  comment_count: number;
  admin_note?: string | null;
  created_at: string;
  reviewed_at?: string | null;
};

export function fetchCommunityPosts(status = "pending", limit = 50, offset = 0) {
  return unwrap(
    api.get<ApiEnvelope<Paged<CommunityPostItem>>>("/admin/v1/community/posts", {
      params: { status, limit, offset },
    }),
  );
}

export function reviewCommunityPost(id: string, action: "approve" | "reject", admin_note?: string) {
  return unwrap(
    api.post<ApiEnvelope<CommunityPostItem>>(`/admin/v1/community/posts/${id}/review`, {
      action,
      admin_note,
    }),
  );
}

export type ActivityItem = {
  id: string;
  host_id: string;
  host_name?: string | null;
  title: string;
  description: string;
  category: string;
  city?: string | null;
  address?: string | null;
  start_at?: string | null;
  capacity: number;
  join_count: number;
  media: Array<{ type: string; url?: string; media_id?: string | null }>;
  status: string;
  admin_note?: string | null;
  created_at: string;
  reviewed_at?: string | null;
};

export function fetchActivities(status = "pending", limit = 50, offset = 0) {
  return unwrap(
    api.get<ApiEnvelope<Paged<ActivityItem>>>("/admin/v1/activities", {
      params: { status, limit, offset },
    }),
  );
}

export function reviewActivity(id: string, action: "approve" | "reject", admin_note?: string) {
  return unwrap(
    api.post<ApiEnvelope<ActivityItem>>(`/admin/v1/activities/${id}/review`, {
      action,
      admin_note,
    }),
  );
}
