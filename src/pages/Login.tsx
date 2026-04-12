import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../lib/api/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await apiLogin(email, apiKey);
      login(token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden relative"
      style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full"
          style={{ top: "-10%", left: "-10%", width: "40%", height: "40%", background: "rgba(173,198,255,0.05)", filter: "blur(120px)" }} />
        <div className="absolute rounded-full"
          style={{ top: "20%", right: "-5%", width: "30%", height: "30%", background: "rgba(208,188,255,0.05)", filter: "blur(100px)" }} />
      </div>

      <main className="relative z-10 w-full max-w-[420px] px-6">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-xl shadow-2xl"
            style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.2)" }}>
            <span className="material-symbols-outlined text-4xl" style={{ color: "#adc6ff", fontVariationSettings: "'FILL' 1" }}>science</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter font-space-grotesk" style={{ color: "#dae2fd" }}>LitmusAI</h1>
          <p className="mt-2 text-sm font-medium tracking-wide uppercase" style={{ color: "#94a3b8" }}>Behavioral AI Testing</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-xl shadow-2xl" style={{ border: "1px solid rgba(66,71,84,0.1)" }}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider uppercase ml-1" style={{ color: "#c2c6d6" }}>
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-lg transition-colors" style={{ color: "#64748b" }}>mail</span>
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="block w-full pl-10 pr-4 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: "#131b2e",
                    border: "1px solid rgba(66,71,84,0.2)",
                    color: "#dae2fd",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#adc6ff";
                    e.target.style.boxShadow = "0 0 0 2px rgba(173,198,255,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(66,71,84,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-semibold tracking-wider uppercase" style={{ color: "#c2c6d6" }}>
                  API Key
                </label>
                <button type="button" className="text-[10px] font-bold transition-all hover:underline" style={{ color: "#adc6ff" }}>
                  RECOVER KEY
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-lg" style={{ color: "#64748b" }}>key</span>
                </div>
                <input
                  type={showKey ? "text" : "password"}
                  autoComplete="current-password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  className="block w-full pl-10 pr-12 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: "#131b2e",
                    border: "1px solid rgba(66,71,84,0.2)",
                    color: "#dae2fd",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#adc6ff";
                    e.target.style.boxShadow = "0 0 0 2px rgba(173,198,255,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(66,71,84,0.2)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                  style={{ color: "#64748b" }}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showKey ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 rounded-lg text-sm font-bold border-transparent transition-all duration-300 active:scale-95 shadow-lg"
              style={{
                backgroundColor: loading ? "#00a572" : "#4edea3",
                color: "#003824",
                border: "1px solid transparent",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(78,222,163,0.1)",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = "#00a572"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = "#4edea3"); }}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#003824" }}>
                  login
                </span>
              </span>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}>
            <div className="flex items-center justify-center space-x-2 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "#64748b" }}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span>High-Trust Analysis Environment</span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-8 flex justify-between items-center text-[11px] font-medium px-2" style={{ color: "#475569" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#4edea3" }} />
            v1.0.0 NODE_READY
          </span>
          <span className="transition-colors cursor-pointer hover:text-slate-400">HELP CENTER</span>
        </div>
      </main>

      {/* Decorative spinning rings */}
      <div className="hidden lg:block fixed bottom-12 right-12 pointer-events-none" style={{ opacity: 0.4 }}>
        <div className="w-64 h-64 relative">
          <div className="absolute inset-0 rounded-full" style={{ border: "0.5px solid rgba(173,198,255,0.2)", animation: "spin 20s linear infinite" }} />
          <div className="absolute inset-8 rounded-full" style={{ border: "0.5px solid rgba(208,188,255,0.2)", animation: "spin 15s linear infinite reverse" }} />
          <div className="absolute inset-16 rounded-full" style={{ border: "0.5px solid rgba(78,222,163,0.2)", animation: "spin 10s linear infinite" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl" style={{ color: "rgba(173,198,255,0.3)" }}>hub</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
