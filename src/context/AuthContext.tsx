"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    role: data.role as "customer" | "admin",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  if (loading) return null;

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
