import { Router, type IRouter, type RequestHandler } from "express";
import { sendOtpEmail } from "../lib/mailer.js";

const router: IRouter = Router();

const ADMIN_USERNAME = process.env["ADMIN_USERNAME"] ?? "admin";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "";

// ── In-memory OTP store ────────────────────────────────────────────────────────
// { otp: string; expiresAt: number; attempts: number }
interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}
let pendingOtp: OtpEntry | null = null;

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Middleware — attach to any route that must be admin-only ──────────────────
export const requireAdmin: RequestHandler = (req, res, next) => {
  const session = (req as any).session;
  if (session?.adminLoggedIn === true) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized. Please log in." });
};

// ── POST /admin/login — Step 1: verify password, send OTP ────────────────────
router.post("/admin/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};

  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: "Admin password not configured on server." });
    return;
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid username or password." });
    return;
  }

  // Password correct — generate OTP and send email
  const otp = generateOtp();
  pendingOtp = {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };

  try {
    await sendOtpEmail(otp);
  } catch (err) {
    console.error("[admin] Failed to send OTP email:", err);
    res.status(500).json({ error: "Failed to send OTP email. Please try again." });
    return;
  }

  res.json({ step: "otp" });
});

// ── POST /admin/verify-otp — Step 2: verify OTP, create session ───────────────
router.post("/admin/verify-otp", (req, res): void => {
  const { otp } = req.body ?? {};

  if (!pendingOtp) {
    res.status(400).json({ error: "No OTP pending. Please start login again." });
    return;
  }

  if (Date.now() > pendingOtp.expiresAt) {
    pendingOtp = null;
    res.status(400).json({ error: "OTP has expired. Please log in again." });
    return;
  }

  pendingOtp.attempts += 1;

  if (pendingOtp.attempts > MAX_OTP_ATTEMPTS) {
    pendingOtp = null;
    res.status(429).json({ error: "Too many incorrect attempts. Please log in again." });
    return;
  }

  if (otp !== pendingOtp.otp) {
    const remaining = MAX_OTP_ATTEMPTS - pendingOtp.attempts;
    res.status(401).json({
      error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    });
    return;
  }

  // OTP correct — clear it and create session
  pendingOtp = null;
  (req as any).session.adminLoggedIn = true;
  res.json({ success: true });
});

// ── POST /admin/logout ─────────────────────────────────────────────────────────
router.post("/admin/logout", (req, res): void => {
  (req as any).session.destroy(() => {
    res.json({ success: true });
  });
});

// ── GET /admin/me — check session status ──────────────────────────────────────
router.get("/admin/me", (req, res): void => {
  const session = (req as any).session;
  if (session?.adminLoggedIn === true) {
    res.json({ loggedIn: true });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

export default router;
