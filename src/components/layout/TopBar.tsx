import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function useBreadcrumbs(): { crumbs: string[]; title: string } {
  const location = useLocation();
  const { runId } = useParams();
  const path = location.pathname;

  if (path.startsWith("/runs/") && runId) {
    if (path.endsWith("/report")) {
      return { crumbs: ["Run History", runId, "Report"], title: "" };
    }
    return { crumbs: ["Run History", runId], title: "" };
  }
  if (path === "/projects") return { crumbs: [], title: "Projects" };
  if (path === "/history")  return { crumbs: [], title: "Run History" };
  return { crumbs: [], title: "Dashboard" };
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handlerRef.current();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref]);
}

function ApiKeyModal({ token, onClose }: { token: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  function copy() {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const masked = token ? "•".repeat(Math.min(token.length, 40)) : "—";

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 rounded-xl p-5 z-50 shadow-2xl"
      style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.2)", boxShadow: "0 24px 48px -12px rgba(6,14,32,0.7)" }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>Session Token</p>
      <div
        className="font-mono text-xs rounded-lg px-3 py-2.5 mb-2 break-all"
        style={{ backgroundColor: "#0b1326", color: "#adc6ff", border: "1px solid rgba(66,71,84,0.2)", userSelect: revealed ? "all" : "none" }}
        aria-label="Session token value"
      >
        {revealed ? (token ?? "—") : masked}
      </div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide session token" : "Reveal session token"}
          className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
          style={{
            background: "rgba(45,52,73,0.6)",
            color: "#94a3b8",
            border: "1px solid rgba(66,71,84,0.2)",
          }}
        >
          {revealed ? "Hide" : "Show"}
        </button>
        <button
          onClick={copy}
          aria-label="Copy session token to clipboard"
          className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
          style={{
            background: copied ? "rgba(78,222,163,0.15)" : "rgba(173,198,255,0.1)",
            color: copied ? "#4edea3" : "#adc6ff",
            border: `1px solid ${copied ? "rgba(78,222,163,0.3)" : "rgba(173,198,255,0.2)"}`,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl p-5 z-50 shadow-2xl"
      style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.2)", boxShadow: "0 24px 48px -12px rgba(6,14,32,0.7)" }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Notifications</p>
      <div className="flex flex-col items-center gap-3 py-6">
        <span className="material-symbols-outlined text-4xl" style={{ color: "#2d3449" }}>notifications_off</span>
        <p className="text-sm text-center" style={{ color: "#424754" }}>No new notifications</p>
      </div>
    </div>
  );
}

function UserMenu({ onClose, logout }: { onClose: () => void; logout: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 shadow-2xl"
      style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.2)", boxShadow: "0 24px 48px -12px rgba(6,14,32,0.7)" }}
    >
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(66,71,84,0.15)" }}>
        <p className="text-sm font-bold font-space-grotesk" style={{ color: "#dae2fd" }}>Account</p>
        <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>LitmusAI User</p>
      </div>
      <button
        onClick={() => { logout(); onClose(); }}
        className="flex items-center gap-2 w-full px-4 py-3 text-sm transition-colors hover:bg-[#2d3449]"
        style={{ color: "#ffb4ab" }}
      >
        <span className="material-symbols-outlined text-base">logout</span>
        Sign Out
      </button>
    </div>
  );
}

export default function TopBar() {
  const { crumbs: breadcrumbs, title } = useBreadcrumbs();
  const { token, logout } = useAuth();

  const [showApiKey, setShowApiKey] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const apiKeyRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  return (
    <header
      className="flex justify-between items-center h-16 px-8 sticky top-0 z-40 shadow-2xl"
      style={{
        backgroundColor: "rgba(11,19,38,0.7)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 48px -12px rgba(6,14,32,0.5)",
      }}
    >
      <div className="flex items-center gap-4">
        {breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: index === breadcrumbs.length - 1 ? "#adc6ff" : "#64748b",
                    fontWeight: index === breadcrumbs.length - 1 ? 700 : 500,
                  }}
                >
                  {crumb}
                </span>
                {index < breadcrumbs.length - 1 && (
                  <span className="material-symbols-outlined text-sm" style={{ color: "#475569" }}>chevron_right</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <h2 className="font-space-grotesk font-bold text-lg" style={{ color: "#adc6ff" }}>{title}</h2>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {/* API Key button */}
          <div ref={apiKeyRef} className="relative">
            <button
              onClick={() => { setShowApiKey((v) => !v); setShowNotifications(false); setShowUserMenu(false); }}
              className="rounded-lg p-2 transition-all duration-300 hover:bg-[#2d3449]"
              style={{ color: showApiKey ? "#adc6ff" : "#94a3b8" }}
              title="View session token"
              aria-label="View session token"
              aria-haspopup="true"
              aria-expanded={showApiKey}
            >
              <span className="material-symbols-outlined">key</span>
            </button>
            {showApiKey && <ApiKeyModal token={token} onClose={() => setShowApiKey(false)} />}
          </div>

          {/* Notifications button */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotifications((v) => !v); setShowApiKey(false); setShowUserMenu(false); }}
              className="rounded-lg p-2 transition-all duration-300 relative hover:bg-[#2d3449]"
              style={{ color: showNotifications ? "#adc6ff" : "#94a3b8" }}
              title="Notifications"
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={showNotifications}
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
          </div>
        </div>

        {/* User avatar */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setShowUserMenu((v) => !v); setShowApiKey(false); setShowNotifications(false); }}
            className="h-8 w-8 rounded-full overflow-hidden transition-all hover:ring-2 hover:ring-[#adc6ff]"
            style={{ border: "1px solid rgba(66,71,84,0.2)" }}
            title="Account"
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={showUserMenu}
          >
            <div
              className="w-full h-full flex items-center justify-center text-sm font-bold font-space-grotesk"
              style={{ background: "linear-gradient(135deg, #adc6ff, #4d8eff)", color: "#002e6a" }}
            >
              U
            </div>
          </button>
          {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} logout={logout} />}
        </div>
      </div>
    </header>
  );
}
