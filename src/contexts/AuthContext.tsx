import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient, apiPost } from "@/api/client";
import type { AdminPermission } from "@/lib/adminPermissions";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: AdminPermission[];
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiClient<AdminUser>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("admin_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiPost<{ token: string; user: AdminUser }>("/auth/login", { email, password });
    localStorage.setItem("admin_token", res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await apiClient<{ message: string }>("/auth/change-password", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
