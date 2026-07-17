import { useState, FormEvent, useRef, useEffect } from "react";
import { ShieldCheck, User, Lock, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";
import { login, verifyOtp } from "@/lib/api";

interface LoginProps {
  onSuccess: () => void;
}

type Step = "password" | "otp";

export default function Login({ onSuccess }: LoginProps) {
  const [step, setStep] = useState<Step>("password");

  // Password step state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // OTP step state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  // ── Step 1: Password ────────────────────────────────────────────────────────
  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwLoading(true);
    try {
      const result = await login(username, password);
      if (result.ok) {
        if (result.step === "authenticated") {
          onSuccess();
          return;
        }

        setStep("otp");
      } else {
        setPwError(result.error);
      }
    } catch {
      setPwError("Server unreachable. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  // ── Step 2: OTP ─────────────────────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 filled
    if (digit && index === 5 && next.every((d) => d !== "")) {
      submitOtp(next.join(""));
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setOtp(next);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (digits.length === 6) submitOtp(digits);
  }

  async function submitOtp(code: string) {
    setOtpError("");
    setOtpLoading(true);
    try {
      const result = await verifyOtp(code);
      if (result.ok) {
        onSuccess();
      } else {
        setOtpError(result.error);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setOtpError("Server unreachable. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    submitOtp(code);
  }

  function goBack() {
    setStep("password");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setPassword("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-10 text-center relative"
            style={{ background: "hsl(215 47% 19%)" }}
          >
            {step === "otp" && (
              <button
                onClick={goBack}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-2 rounded-lg"
                title="Back to login"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              {step === "password" ? (
                <ShieldCheck className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Gig Connect India
            </h1>
            <p className="text-white/60 text-sm mt-1 font-medium uppercase tracking-widest">
              {step === "password" ? "Admin Portal" : "Email Verification"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex" style={{ background: "hsl(215 47% 14%)" }}>
            {(["password", "otp"] as Step[]).map((s, i) => (
              <div
                key={s}
                className="flex-1 flex items-center gap-2 px-6 py-2.5"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: step === s || (s === "password" && step === "otp") ? "#f47c20" : "rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                >
                  {s === "password" && step === "otp" ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium" style={{ color: step === s ? "#fff" : "rgba(255,255,255,0.4)" }}>
                  {s === "password" ? "Password" : "OTP Verify"}
                </span>
              </div>
            ))}
          </div>

          <div className="px-8 py-8">
            {step === "password" ? (
              <>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Restricted access — authorised personnel only
                </p>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {pwError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                      {pwError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
                    style={{ background: "hsl(215 47% 19%)" }}
                  >
                    {pwLoading ? "Verifying…" : "Continue →"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center mb-1">
                  A 6-digit OTP has been sent to your email.
                </p>
                <p className="text-xs text-center mb-6" style={{ color: "#f47c20" }}>
                  Check your inbox — expires in 5 minutes.
                </p>

                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  {/* OTP boxes */}
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={otpLoading}
                        className="w-11 h-13 text-center text-xl font-bold rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary transition disabled:opacity-50"
                        style={{
                          height: "52px",
                          borderColor: digit ? "hsl(215 47% 19%)" : undefined,
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 text-center">
                      {otpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpLoading || otp.some((d) => !d)}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
                    style={{ background: "hsl(215 47% 19%)" }}
                  >
                    {otpLoading ? "Verifying OTP…" : "Verify & Sign In"}
                  </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Didn't get the email?{" "}
                  <button
                    onClick={goBack}
                    className="underline hover:text-foreground transition"
                  >
                    Go back and try again
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Gig Connect India · Admin Portal · Private
        </p>
      </div>
    </div>
  );
}
