"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("enter a valid email"); return; }

    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError("something went wrong, please try again");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md border border-ink/10 p-10">
        <h1 className="font-playfair text-4xl text-ink mb-2">check your email.</h1>
        <p className="font-inter text-sm text-ink/50 mb-8 leading-relaxed">
          if an account exists for <span className="text-ink">{email}</span>, you&apos;ll receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors"
        >
          ← back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md border border-ink/10 p-10">
      <h1 className="font-playfair text-4xl text-ink mb-2">forgot password.</h1>
      <p className="font-inter text-sm text-ink/50 mb-10 leading-relaxed">
        enter your email and we&apos;ll send you a link to reset your password.
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
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="jane@example.com"
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
          {error && <p className="font-inter text-xs text-burgundy mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-burgundy text-cream py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors mt-2 disabled:opacity-50"
        >
          {loading ? "sending..." : "send reset link"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="font-inter text-xs tracking-widest uppercase text-ink/30 hover:text-burgundy transition-colors">
          ← back to login
        </Link>
      </div>
    </div>
  );
}
