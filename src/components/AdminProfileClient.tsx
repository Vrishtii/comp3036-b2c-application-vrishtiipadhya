"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminProfileClient() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState<{ full_name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }

      const res = await fetch("/api/profile", {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data: Profile = await res.json();
        setProfile(data);
        setForm({ full_name: data.full_name || "", email: data.email || "", phone: data.phone || "" });
      }

      setLoading(false);
    });
  }, [router]);

  function validate() {
    const errors: { full_name?: string; email?: string } = {};
    if (!form.full_name.trim()) errors.full_name = "name is required";
    if (!form.email.trim()) errors.email = "email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "enter a valid email";
    return errors;
  }

  async function handleSave() {
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setSaveError(err.error || "failed to save changes");
      setSaving(false);
      return;
    }

    const updated: Profile = await res.json();
    setProfile(updated);
    setEditing(false);
    setSaveSuccess(true);
    setSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handleCancel() {
    if (profile) {
      setForm({ full_name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "" });
    }
    setFormErrors({});
    setSaveError("");
    setEditing(false);
  }

  return (
    <AdminShell>
      <h1 className="font-playfair text-4xl text-ink mb-10">profile.</h1>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-ink/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Account info — always read-only */}
          <section className="mb-10">
            <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">account info</p>
            <div className="border border-ink/10">
              {[
                { label: "role", value: profile?.role ?? "—" },
                { label: "member since", value: profile?.created_at ? formatDate(profile.created_at) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-6 py-4 border-b border-ink/10 last:border-b-0">
                  <span className="font-inter text-xs tracking-widest uppercase text-ink/40">{label}</span>
                  <span className="font-inter text-sm text-ink capitalize">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Editable details */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40">account details</p>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors"
                >
                  edit
                </button>
              )}
            </div>

            <div className="border border-ink/10">
              {editing ? (
                <div className="p-6 flex flex-col gap-5">
                  {/* full name */}
                  <div>
                    <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
                      full name<span className="text-burgundy ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => { setForm((p) => ({ ...p, full_name: e.target.value })); setFormErrors((p) => ({ ...p, full_name: undefined })); }}
                      className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
                    />
                    {formErrors.full_name && <p className="font-inter text-xs text-burgundy mt-1">{formErrors.full_name}</p>}
                  </div>

                  {/* email */}
                  <div>
                    <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
                      email<span className="text-burgundy ml-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setFormErrors((p) => ({ ...p, email: undefined })); }}
                      className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
                    />
                    {formErrors.email && <p className="font-inter text-xs text-burgundy mt-1">{formErrors.email}</p>}
                  </div>

                  {/* phone */}
                  <div>
                    <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
                      phone number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+61 400 000 000"
                      className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
                    />
                  </div>

                  {saveError && <p className="font-inter text-xs text-burgundy">{saveError}</p>}

                  <div className="flex gap-4 pt-1">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 border border-ink/20 font-inter text-xs tracking-widest uppercase text-ink/50 hover:border-ink hover:text-ink transition-colors"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-burgundy text-cream font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
                    >
                      {saving ? "saving..." : "save changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {[
                    { label: "full name", value: profile?.full_name || "—" },
                    { label: "email", value: profile?.email || "—" },
                    { label: "phone", value: profile?.phone || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center px-6 py-4 border-b border-ink/10 last:border-b-0">
                      <span className="font-inter text-xs tracking-widest uppercase text-ink/40">{label}</span>
                      <span className="font-inter text-sm text-ink">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {saveSuccess && (
              <p className="font-inter text-xs text-burgundy mt-3">profile updated successfully.</p>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
