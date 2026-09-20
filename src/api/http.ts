import type { ApiEnvelope } from "./client";
import api from "./client";

export type Paged<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  page_info?: {
    total?: number;
    has_more?: boolean;
    next_cursor?: string | null;
  };
};

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (data.code !== 0) {
    throw new Error(data.message || "请求失败");
  }
  return data.data;
}

export { api };
