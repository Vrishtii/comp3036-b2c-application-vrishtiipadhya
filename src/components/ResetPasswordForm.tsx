"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  function validate() {
    const e: { password?: string; confirm?: string } = {};
    if (!password) e.password = "password is required";
    else if (password.length < 8) e.password = "password must be at least 8 characters";
    if (!confirm) e.confirm = "please confirm your password";
    else if (confirm !== password) e.confirm = "passwords do not match";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="w-full max-w-md border border-ink/10 p-10 text-center">
        <p className="font-playfair text-3xl text-ink mb-3">waiting for link...</p>
        <p className="font-inter text-sm text-ink/50">
          please click the reset link in your email to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md border border-ink/10 p-10">
      <h1 className="font-playfair text-4xl text-ink mb-2">reset password.</h1>
      <p className="font-inter text-sm text-ink/50 mb-10">choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="password" className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
            new password<span className="text-burgundy ml-0.5">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
            placeholder="min. 8 characters"
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
          {errors.password && <p className="font-inter text-xs text-burgundy mt-1">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
            confirm password<span className="text-burgundy ml-0.5">*</span>
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => {
              const val = e.target.value;
              setConfirm(val);
              if (val && val !== password) setErrors((p) => ({ ...p, confirm: "passwords do not match" }));
              else setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            placeholder="••••••••"
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
          {errors.confirm && <p className="font-inter text-xs text-burgundy mt-1">{errors.confirm}</p>}
        </div>

        {error && <p className="font-inter text-xs text-burgundy">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-burgundy text-cream py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors mt-2 disabled:opacity-50"
        >
          {loading ? "updating..." : "update password"}
        </button>
      </form>
    </div>
  );
}
