import { useState, useEffect, useCallback } from "react";
import {
  Users, MessageSquare, MapPin, Building,
  Download, LogOut, RefreshCw, Activity,
} from "lucide-react";
import { format } from "date-fns";
import {
  fetchWorkers, fetchContacts, fetchStats, downloadExcel, logout,
  type Worker, type ContactMessage, type Stats,
} from "@/lib/api";

interface DashboardProps {
  onLogout: () => void;
}

const WORK_TYPE_COLORS: Record<string, string> = {
  delivery:     "bg-blue-100 text-blue-800",
  ride_sharing: "bg-green-100 text-green-800",
  domestic:     "bg-purple-100 text-purple-800",
  construction: "bg-amber-100 text-amber-800",
  freelance:    "bg-rose-100 text-rose-800",
  other:        "bg-gray-100 text-gray-700",
};

export default function Dashboard({ onLogout }: DashboardProps) {
  const [tab, setTab] = useState<"workers" | "messages">("workers");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [w, c, s] = await Promise.all([
        fetchWorkers(),
        fetchContacts(),
        fetchStats(),
      ]);
      setWorkers(w.workers);
      setMessages(c.messages);
      setStats(s);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleLogout() {
    await logout();
    onLogout();
  }

  async function handleExport() {
    setExporting(true);
    try { await downloadExcel(); }
    catch { alert("Export failed. Please try again."); }
    finally { setExporting(false); }
  }

  const statCards = [
    { label: "Registered Workers", value: stats?.workersConnected ?? workers.length, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Cities Active",      value: stats?.cities ?? 0,                        icon: MapPin, color: "bg-green-50 text-green-600" },
    { label: "Welfare Partners",   value: stats?.welfarePartners ?? 0,               icon: Building, color: "bg-purple-50 text-purple-600" },
    { label: "Contact Messages",   value: messages.length,                           icon: MessageSquare, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(215 47% 19%)" }}
          >
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-sm">
            Gig Connect India &mdash; Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition disabled:opacity-60"
            style={{ background: "#16a34a" }}
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-foreground leading-tight">
                  {loading ? "—" : s.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab Header */}
          <div className="border-b border-slate-100 px-6 pt-4 flex gap-1">
            {(["workers", "messages"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition capitalize ${
                  tab === t
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={tab === t ? { color: "hsl(215 47% 19%)", borderColor: "hsl(215 47% 19%)" } : {}}
              >
                {t === "workers" ? `Registered Workers (${workers.length})` : `Contact Messages (${messages.length})`}
              </button>
            ))}
          </div>

          {/* Workers Table */}
          {tab === "workers" && (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
              ) : workers.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No workers registered yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase text-muted-foreground tracking-wider">
                      <th className="px-5 py-3 text-left font-semibold">Name</th>
                      <th className="px-5 py-3 text-left font-semibold">Location</th>
                      <th className="px-5 py-3 text-left font-semibold">Contact</th>
                      <th className="px-5 py-3 text-left font-semibold">Work Type</th>
                      <th className="px-5 py-3 text-left font-semibold">Platform</th>
                      <th className="px-5 py-3 text-right font-semibold">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {workers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3.5 font-medium text-foreground">{w.name}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          <span>{w.city}</span>
                          <span className="text-xs block opacity-70">{w.state}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-foreground">{w.phone}</span>
                          {w.email && <span className="text-xs block text-muted-foreground">{w.email}</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${WORK_TYPE_COLORS[w.workType] ?? WORK_TYPE_COLORS.other}`}
                          >
                            {w.workType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{w.platform ?? "—"}</td>
                        <td className="px-5 py-3.5 text-right text-muted-foreground">
                          {format(new Date(w.joinedAt), "dd MMM yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Messages Table */}
          {tab === "messages" && (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
              ) : messages.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No contact messages yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase text-muted-foreground tracking-wider">
                      <th className="px-5 py-3 text-left font-semibold">Sender</th>
                      <th className="px-5 py-3 text-left font-semibold">Subject</th>
                      <th className="px-5 py-3 text-left font-semibold">Message</th>
                      <th className="px-5 py-3 text-right font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {messages.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-foreground">{m.name}</span>
                          <span className="text-xs block text-muted-foreground">{m.email}</span>
                          {m.phone && <span className="text-xs block text-muted-foreground">{m.phone}</span>}
                        </td>
                        <td className="px-5 py-3.5 font-medium" style={{ color: "hsl(215 47% 19%)" }}>
                          {m.subject}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground max-w-sm">
                          <p className="line-clamp-2" title={m.message}>{m.message}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right text-muted-foreground whitespace-nowrap">
                          {format(new Date(m.submittedAt), "dd MMM yyyy, h:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
