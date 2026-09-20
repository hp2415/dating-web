import { api, unwrap } from "./http";

export type SmsStats7d = {
  total: number;
  sent: number;
  failed: number;
  success_rate?: number | null;
};

export type SmsConfig = {
  provider: string;
  allow_dev_code: boolean;
  ready: boolean;
  sign_name_set?: boolean;
  template_set?: boolean;
  dev_code_configured?: boolean;
  whitelist?: string;
  whitelist_count?: number;
  daily_limit?: number;
  send_interval_seconds?: number;
  sign_name?: string;
  template_code?: string;
  access_key_set?: boolean;
  access_key_id_masked?: string;
  note?: string;
  stats_7d?: SmsStats7d;
  changed?: string[];
  restart_recommended?: boolean;
};

export type SmsLogItem = {
  id: string;
  phone_masked: string;
  scene: string;
  provider: string;
  status: string;
  provider_msg_id?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at?: string | null;
};

export function fetchSmsConfig() {
  return unwrap(api.get("/admin/v1/config/sms")) as Promise<SmsConfig>;
}

export function updateSmsConfig(body: {
  allow_dev_code?: boolean;
  daily_limit?: number;
  send_interval_seconds?: number;
  whitelist?: string;
  sign_name?: string;
  template_code?: string;
  access_key_id?: string;
  access_key_secret?: string;
  provider?: string;
}) {
  return unwrap(api.put("/admin/v1/config/sms", body)) as Promise<SmsConfig>;
}

export function testSendSms(phone: string) {
  return unwrap(api.post("/admin/v1/config/sms/test-send", null, { params: { phone } }));
}

export function fetchSmsLogs(params: {
  phone?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return unwrap(api.get("/admin/v1/sms-logs", { params })) as Promise<{
    items: SmsLogItem[];
    total: number;
  }>;
}
