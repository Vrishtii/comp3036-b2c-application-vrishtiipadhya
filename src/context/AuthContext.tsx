"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_KEY = "crave_auth";
const USERS_KEY = "crave_users";

const ADMIN: User & { password: string } = {
  id: "admin-1",
  name: "Admin",
  email: "admin@crave.com",
  password: "admin123",
  role: "admin",
};

interface StoredUser extends User {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
  }, []);

  function login(email: string, password: string): { success: boolean; error?: string } {
    // Check admin account
    if (email === ADMIN.email && password === ADMIN.password) {
      const { password: _, ...adminUser } = ADMIN;
      void _;
      setUser(adminUser);
      localStorage.setItem(AUTH_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    // Check registered users
    const users = getStoredUsers();
    const match = users.find((u) => u.email === email && u.password === password);
    if (match) {
      const { password: _, ...loggedInUser } = match;
      void _;
      setUser(loggedInUser);
      localStorage.setItem(AUTH_KEY, JSON.stringify(loggedInUser));
      return { success: true };
    }

    return { success: false, error: "invalid email or password" };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }

  function register(name: string, email: string, password: string): { success: boolean; error?: string } {
    if (email === ADMIN.email) {
      return { success: false, error: "an account with this email already exists" };
    }

    const users = getStoredUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "an account with this email already exists" };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "customer",
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

    const { password: _, ...loggedInUser } = newUser;
    void _;
    setUser(loggedInUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(loggedInUser));
    return { success: true };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
