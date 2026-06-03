"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        window.location.href = redirectTo;
      } else {
        setError(result.error ?? "something went wrong");
        setLoading(false);
      }
    } catch {
      setError("something went wrong, please try again");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md border border-ink/10 p-10">
      <h1 className="font-playfair text-4xl text-ink mb-2">welcome back.</h1>
      <p className="font-inter text-sm text-ink/50 mb-10">
        sign in to place your order.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
            email<span className="text-burgundy ml-0.5">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
            password<span className="text-burgundy ml-0.5">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
        </div>

        {error && (
          <p className="font-inter text-xs text-burgundy">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-burgundy text-cream py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors mt-2 disabled:opacity-50"
        >
          {loading ? "signing in..." : "sign in"}
        </button>
      </form>

      <div className="flex flex-col gap-4 mt-8 text-center">
        <p className="font-inter text-sm text-ink/50">
          don&apos;t have an account?{" "}
          <Link href="/register" className="text-burgundy hover:text-ink transition-colors">
            register here →
          </Link>
        </p>
        <Link
          href="/menu"
          className="font-inter text-xs tracking-widest uppercase text-ink/30 hover:text-burgundy transition-colors"
        >
          continue as guest
        </Link>
      </div>
    </div>
  );
}
