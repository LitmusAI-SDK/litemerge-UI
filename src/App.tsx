import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import DashboardOverview from "./pages/DashboardOverview";
import ProjectsPage from "./pages/ProjectsPage";
import HistoryPage from "./pages/HistoryPage";
import RunView from "./pages/RunView";
import ReportView from "./pages/ReportView";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/runs/:runId" element={<RunView />} />
        <Route path="/runs/:runId/report" element={<ReportView />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
