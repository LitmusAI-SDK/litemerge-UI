import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createRun } from "../../lib/api/runs";
import type { Project, TestSuite } from "../../types/api";

interface RunLaunchModalProps {
  project: Project;
  onClose: () => void;
}

const SUITES: { id: TestSuite; label: string; description: string; personas: string }[] = [
  {
    id: "standard",
    label: "Standard",
    description: "7 personas, balanced coverage",
    personas: "p1–p7",
  },
  {
    id: "adversarial",
    label: "Adversarial",
    description: "4 stress-test personas only",
    personas: "p2, p4, p7, p8",
  },
  {
    id: "full",
    label: "Full Suite",
    description: "All 8 personas, deepest coverage",
    personas: "p1–p8",
  },
];

export default function RunLaunchModal({ project, onClose }: RunLaunchModalProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [suite, setSuite] = useState<TestSuite>("standard");
  const [threshold, setThreshold] = useState(70);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLaunch() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createRun(
        {
          project_id: project.id,
          test_suite: suite,
          fail_threshold: threshold,
          ...(webhook ? { notify_webhook: webhook } : {}),
        },
        token
      );
      navigate(`/runs/${res.run_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(6,14,32,0.85)" }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg glass-card rounded-xl"
        style={{ border: "1px solid rgba(66,71,84,0.1)", boxShadow: "0 32px 64px rgba(6,14,32,0.6)" }}
      >
        {/* Header */}
        <div className="p-8" style={{ borderBottom: "1px solid rgba(66,71,84,0.1)" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-space-grotesk font-bold" style={{ color: "#dae2fd" }}>
              Launch Simulation
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-[#2d3449] transition-colors" style={{ color: "#8c909f" }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm font-mono" style={{ color: "#64748b" }}>{project.name}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Suite picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
              Test Suite
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SUITES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSuite(s.id)}
                  className="p-4 rounded-lg text-left transition-all"
                  style={{
                    backgroundColor: suite === s.id ? "rgba(45,52,73,0.9)" : "#171f33",
                    border: suite === s.id ? "1px solid #adc6ff" : "1px solid rgba(66,71,84,0.2)",
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: suite === s.id ? "#adc6ff" : "#dae2fd" }}>
                    {s.label}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>{s.description}</p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: "#424754" }}>{s.personas}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Threshold slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold tracking-widest uppercase" style={{ color: "#adc6ff" }}>
                Pass Threshold
              </label>
              <span className="text-lg font-space-grotesk font-bold" style={{ color: threshold >= 70 ? "#4edea3" : threshold >= 50 ? "#F59E0B" : "#ffb4ab" }}>
                {threshold}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono" style={{ color: "#424754" }}>
              <span>0 — Lenient</span>
              <span>100 — Strict</span>
            </div>
          </div>

          {/* Webhook accordion */}
          <div>
            <button
              type="button"
              onClick={() => setWebhookOpen((v) => !v)}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[#2d3449]"
              style={{ backgroundColor: "#171f33" }}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ color: "#8c909f" }}>webhook</span>
                <span className="text-sm font-bold" style={{ color: "#c2c6d6" }}>Webhook Notification</span>
              </div>
              <span
                className="material-symbols-outlined text-sm transition-transform"
                style={{ color: "#8c909f", transform: webhookOpen ? "rotate(180deg)" : "rotate(0)" }}
              >
                expand_more
              </span>
            </button>
            {webhookOpen && (
              <div className="mt-3">
                <input
                  type="url"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  placeholder="https://your-ci.example.com/webhook"
                  className="w-full p-3 rounded-lg font-mono text-sm transition-all"
                  style={{ backgroundColor: "#131b2e", border: "1px solid rgba(66,71,84,0.2)", color: "#dae2fd", outline: "none" }}
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-8 flex gap-4" style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg font-bold transition-colors hover:bg-[#adc6ff]/10"
            style={{ color: "#adc6ff" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={loading}
            className="flex-[2] px-6 py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #adc6ff, #4d8eff)",
              color: "#002e6a",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 16px rgba(173,198,255,0.2)",
            }}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            {loading ? "Launching…" : "Launch"}
          </button>
        </div>
      </div>
    </div>
  );
}
