// All API calls use credentials: 'include' so the session cookie is sent.
const API_BASE = "/api";

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  return res;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function checkSession(): Promise<boolean> {
  try {
    const r = await apiFetch("/admin/me");
    return r.ok;
  } catch {
    return false;
  }
}

/** Step 1 — verify password. Returns null on success (OTP sent), or error string. */
export async function login(
  username: string,
  password: string
): Promise<{ ok: true; step?: "otp" | "authenticated"; warning?: string } | { ok: false; error: string }> {
  const r = await apiFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (r.ok) return r.json();
  const d = await r.json().catch(() => ({}));
  return { ok: false, error: d.error ?? "Login failed" };
}

/** Step 2 — verify OTP. Returns null on success, or error string. */
export async function verifyOtp(
  otp: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await apiFetch("/admin/verify-otp", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
  if (r.ok) return { ok: true };
  const d = await r.json().catch(() => ({}));
  return { ok: false, error: d.error ?? "OTP verification failed" };
}

export async function logout(): Promise<void> {
  await apiFetch("/admin/logout", { method: "POST" });
}

// ── Workers ───────────────────────────────────────────────────────────────────
export interface Worker {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  state: string;
  workType: string;
  platform?: string;
  message?: string;
  joinedAt: string;
}

export async function fetchWorkers(): Promise<{ workers: Worker[]; total: number }> {
  const r = await apiFetch("/workers");
  if (!r.ok) throw new Error("Failed to fetch workers");
  return r.json();
}

// ── Contacts ──────────────────────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export async function fetchContacts(): Promise<{ messages: ContactMessage[]; total: number }> {
  const r = await apiFetch("/contact/messages");
  if (!r.ok) throw new Error("Failed to fetch messages");
  return r.json();
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export interface Stats {
  workersConnected: number;
  cities: number;
  welfarePartners: number;
  eventsOrganized: number;
}

export async function fetchStats(): Promise<Stats> {
  const r = await apiFetch("/stats");
  if (!r.ok) throw new Error("Failed to fetch stats");
  return r.json();
}

// ── Export ────────────────────────────────────────────────────────────────────
export async function downloadExcel(): Promise<void> {
  const r = await fetch(`${API_BASE}/workers/export`, { credentials: "include" });
  if (!r.ok) throw new Error("Export failed");
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gig-connect-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
