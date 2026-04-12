import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell() {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#0b1326" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
