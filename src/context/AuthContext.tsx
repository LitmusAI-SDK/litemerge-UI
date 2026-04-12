import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "litmusai_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY)
  );
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && !token) setToken(stored);
  }, []);

  function login(t: string) {
    sessionStorage.setItem(STORAGE_KEY, t);
    setToken(t);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
