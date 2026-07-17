import { useState, useEffect } from "react";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { checkSession } from "@/lib/api";

type AuthState = "checking" | "out" | "in";

export default function App() {
  const [auth, setAuth] = useState<AuthState>("checking");

  useEffect(() => {
    checkSession().then((ok) => setAuth(ok ? "in" : "out"));
  }, []);

  if (auth === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-400">Checking session…</div>
      </div>
    );
  }

  if (auth === "out") {
    return <Login onSuccess={() => setAuth("in")} />;
  }

  return <Dashboard onLogout={() => setAuth("out")} />;
}
