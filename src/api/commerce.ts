import { api, unwrap, type Paged } from "./http";

export type OrderItem = {
  id: string;
  order_no: string;
  user_id: string;
  kind: string;
  subject_title: string;
  amount_cents: number;
  payable_cents: number;
  status: string;
  pay_method?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
};

export type RefundItem = {
  id: string;
  order_id: string;
  user_id: string;
  amount_cents: number;
  amount_display?: string;
  reason: string;
  status: string;
  created_at?: string | null;
};

export type LedgerItem = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  amount_cents: number;
  balance_after_cents: number;
  created_at?: string | null;
};

export function fetchOrders(params: {
  q?: string;
  kind?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return unwrap(api.get("/admin/v1/orders", { params }));
}

export function fetchOrder(id: string) {
  return unwrap(api.get(`/admin/v1/orders/${id}`));
}

export function closeOrder(id: string) {
  return unwrap(api.post(`/admin/v1/orders/${id}/close`));
}

export function fetchRefunds(params: { status?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/refunds", { params }));
}

export function processRefund(id: string, action: "complete" | "reject", admin_note?: string) {
  return unwrap(api.post(`/admin/v1/refunds/${id}/process`, { action, admin_note }));
}

export function fetchWalletLedger(params: { user_id?: string; limit?: number; offset?: number }) {
  return unwrap(api.get("/admin/v1/wallet/ledger", { params }));
}

export function fetchReconciliation() {
  return unwrap(api.get("/admin/v1/finance/reconciliation"));
}

export type { Paged };
