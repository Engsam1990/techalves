import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiClient } from "@/api/client";

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "customer";
  createdAt?: string;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { fullName: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: { fullName: string; phone?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string; resetUrl?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);
const TOKEN_KEY = "customer_token";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const refreshProfile = async () => {
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await apiClient<CustomerUser>("/customer-auth/me", {
        headers: authHeaders,
      });
      setCustomer(profile);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiClient<{ token: string; user: CustomerUser }>("/customer-auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setCustomer(res.user);
  };

  const register = async (payload: { fullName: string; email: string; phone?: string; password: string }) => {
    const res = await apiClient<{ token: string; user: CustomerUser }>("/customer-auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setCustomer(res.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  };

  const updateProfile = async (payload: { fullName: string; phone?: string }) => {
    const updated = await apiClient<CustomerUser>("/customer-auth/profile", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    setCustomer(updated);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await apiClient<{ message: string }>("/customer-auth/change-password", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const forgotPassword = async (email: string) => {
    return apiClient<{ message: string; resetToken?: string; resetUrl?: string }>("/customer-auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    await apiClient<{ message: string }>("/customer-auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
