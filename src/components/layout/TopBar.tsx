import { useLocation, useParams } from "react-router-dom";

interface TopBarProps {
  title?: string;
  breadcrumbs?: string[];
}

function useBreadcrumbs(): string[] {
  const location = useLocation();
  const { runId } = useParams();

  if (location.pathname.startsWith("/runs/") && runId) {
    if (location.pathname.endsWith("/report")) {
      return ["Runs", runId, "Report"];
    }
    return ["Runs", runId];
  }
  return [];
}

export default function TopBar({ title = "Dashboard" }: TopBarProps) {
  const breadcrumbs = useBreadcrumbs();

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
                  style={{ color: index === breadcrumbs.length - 1 ? "#adc6ff" : "#64748b", fontWeight: index === breadcrumbs.length - 1 ? 700 : 500 }}
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
          <button
            className="rounded-lg p-2 transition-all duration-300 hover:bg-[#2d3449]"
            style={{ color: "#94a3b8" }}
            title="API Key"
          >
            <span className="material-symbols-outlined">key</span>
          </button>
          <button
            className="rounded-lg p-2 transition-all duration-300 relative hover:bg-[#2d3449]"
            style={{ color: "#94a3b8" }}
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{ backgroundColor: "#ffb4ab" }}
            />
          </button>
        </div>
        <div
          className="h-8 w-8 rounded-full overflow-hidden"
          style={{ border: "1px solid rgba(66,71,84,0.2)" }}
        >
          <div
            className="w-full h-full flex items-center justify-center text-sm font-bold font-space-grotesk"
            style={{ background: "linear-gradient(135deg, #adc6ff, #4d8eff)", color: "#002e6a" }}
          >
            U
          </div>
        </div>
      </div>
    </header>
  );
}
