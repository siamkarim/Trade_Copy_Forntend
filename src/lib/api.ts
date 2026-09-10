export type User = {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  kill_switch: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Account = {
  id: string;
  display_name: string;
  kind: "IB" | "MT5" | string;
  role: "master" | "slave" | string;
  bridge: string;
  login: string;
  server: string;
  currency: string;
  margin_mode: string;
  status: string;
  last_error: string;
  last_seen_at: string | null;
};

export type CopyRule = {
  id: string;
  master_account_id: string;
  slave_account_id: string;
  enabled: boolean;
  sizing_mode: string;
  sizing_value: string;
  max_lot_per_trade: string | null;
  max_open_positions: number | null;
  max_daily_loss: string | null;
  symbol_whitelist: string[];
  copy_sl_tp: boolean;
  reverse: boolean;
  below_min_policy: string;
};

export type Mt5AccountIn = {
  role: "master" | "slave";
  display_name: string;
  login: string;
  password: string;
  server: string;
  investor?: boolean;
};

export type IbAccountIn = {
  display_name: string;
  user: string;
  password: string;
  host: string;
  port: number;
  client_id: number;
  account_id: string;
};

export type CopyRuleIn = {
  master_account_id: string;
  slave_account_id: string;
  sizing_mode: string;
  sizing_value: string;
  max_lot_per_trade?: string;
  max_open_positions?: number;
  max_daily_loss?: string;
  symbol_whitelist: string[];
  copy_sl_tp: boolean;
  reverse: boolean;
  below_min_policy: string;
};

const TOKEN_KEY = "tc.token";

export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, { ...init, headers });
  } catch {
    throw new Error("Cannot reach the API. Is the backend running?");
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(extractError(data, response.status));
  }
  return data as T;
}

function extractError(data: unknown, status: number): string {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (typeof rec.detail === "string") return rec.detail;
    if (Array.isArray(rec.detail) && rec.detail[0] && typeof rec.detail[0] === "object") {
      const first = rec.detail[0] as { msg?: string };
      if (first.msg) return first.msg;
    }
  }
  if (status === 401) return "Session expired. Sign in again.";
  return `Request failed (${status})`;
}

export const api = {
  register: (body: { email: string; password: string; full_name: string }) =>
    request<TokenResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<TokenResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<User>("/api/auth/me"),
  accounts: () => request<Account[]>("/api/accounts"),
  addMt5: (body: Mt5AccountIn) =>
    request<Account>("/api/accounts/mt5", { method: "POST", body: JSON.stringify(body) }),
  addIb: (body: IbAccountIn) =>
    request<Account>("/api/accounts/ib", { method: "POST", body: JSON.stringify(body) }),
  retireAccount: (id: string) =>
    request<void>(`/api/accounts/${id}`, { method: "DELETE" }),
  rules: () => request<CopyRule[]>("/api/copy-rules"),
  createRule: (body: CopyRuleIn) =>
    request<CopyRule>("/api/copy-rules", { method: "POST", body: JSON.stringify(body) }),
  setRuleEnabled: (id: string, enabled: boolean) =>
    request<CopyRule>(`/api/copy-rules/${id}/enable?enabled=${enabled}`, { method: "POST" }),
};
