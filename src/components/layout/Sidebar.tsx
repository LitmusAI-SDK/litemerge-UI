import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium transition-colors duration-200 text-sm text-left ${
        active ? "font-bold border-r-2" : "hover:bg-[#2d3449]"
      }`}
      style={
        active
          ? { color: "#adc6ff", borderColor: "#adc6ff", backgroundColor: "rgba(45,52,73,0.5)" }
          : { color: "#94a3b8" }
      }
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-8 px-4 z-50"
      style={{ backgroundColor: "#131b2e" }}>

      {/* Logo */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #adc6ff, #4d8eff)" }}>
          <span className="material-symbols-outlined text-xl"
            style={{ color: "#002e6a", fontVariationSettings: "'FILL' 1" }}>science</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tighter font-space-grotesk" style={{ color: "#adc6ff" }}>
            LitmusAI
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>
            Observational Engine
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <NavItem
          icon="dashboard"
          label="Dashboard"
          active={path === "/dashboard"}
          onClick={() => navigate("/dashboard")}
        />
        <NavItem
          icon="folder_shared"
          label="Projects"
          active={path === "/projects"}
          onClick={() => navigate("/projects")}
        />
        <NavItem
          icon="history"
          label="Run History"
          active={path === "/history"}
          onClick={() => navigate("/history")}
        />
      </nav>

      {/* Sign out */}
      <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(66,71,84,0.1)" }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium transition-colors duration-200 text-sm hover:bg-[#2d3449]"
          style={{ color: "#94a3b8" }}
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
