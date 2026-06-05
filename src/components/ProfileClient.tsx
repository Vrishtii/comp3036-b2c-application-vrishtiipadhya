"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import PreferencePicker from "@/components/PreferencePicker";
import DeleteAccountModal from "@/components/DeleteAccountModal";

const supabase = createClient();

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  preferences: string[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  custom_notes: string | null;
  products: { id: string; name: string; image_url: string | null } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  pickup_date: string;
  pickup_time: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_LABEL: Record<string, string> = {
  pending:   "pending",
  confirmed: "confirmed",
  ready:     "ready for pickup",
  completed: "completed",
  cancelled: "cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  pending:   "text-ink/50 border-ink/20",
  confirmed: "text-ink border-ink/50",
  ready:     "text-burgundy border-burgundy bg-burgundy/5",
  completed: "text-ink/30 border-ink/10",
  cancelled: "text-burgundy/50 border-burgundy/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileClient() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState<{ full_name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [preferences, setPreferences] = useState<string[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<{ current?: string; newPw?: string; confirm?: string }>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }

      const headers = { "Authorization": `Bearer ${session.access_token}` };

      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/profile", { headers }),
        fetch("/api/orders", { headers }),
      ]);

      if (profileRes.ok) {
        const data: Profile = await profileRes.json();
        setProfile(data);
        setForm({ full_name: data.full_name || "", email: data.email || "", phone: data.phone || "" });
        setPreferences(data.preferences ?? []);
      }

      if (ordersRes.ok) {
        const data: Order[] = await ordersRes.json();
        setOrders(data);
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

  async function handleChangePassword() {
    const errs: typeof pwErrors = {};
    if (!pwForm.current) errs.current = "current password is required";
    if (!pwForm.newPw) errs.newPw = "new password is required";
    else if (pwForm.newPw.length < 8) errs.newPw = "password must be at least 8 characters";
    if (!pwForm.confirm) errs.confirm = "please confirm your new password";
    else if (pwForm.confirm !== pwForm.newPw) errs.confirm = "passwords do not match";
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setPwSaving(true);
    setPwError("");
    setPwSuccess(false);

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile!.email,
      password: pwForm.current,
    });

    if (signInError) {
      setPwErrors({ current: "current password is incorrect" });
      setPwSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.newPw });

    if (updateError) {
      setPwError(updateError.message);
      setPwSaving(false);
      return;
    }

    setPwForm({ current: "", newPw: "", confirm: "" });
    setPwErrors({});
    setPwSaving(false);
    setPwSuccess(true);
    setShowChangePw(false);
    setTimeout(() => setPwSuccess(false), 3000);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }

    const res = await fetch("/api/profile", {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } else {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function handlePreferenceChange(newPrefs: string[]) {
    setPreferences(newPrefs);
    setSavingPrefs(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSavingPrefs(false); return; }
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: newPrefs }),
    });
    setSavingPrefs(false);
  }

  function handleCancel() {
    if (profile) {
      setForm({ full_name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "" });
    }
    setFormErrors({});
    setSaveError("");
    setEditing(false);
  }

  if (loading) {
    return (
      <main className="px-8 md:px-20 pt-36 pb-20 min-h-screen">
        <div className="h-12 bg-ink/5 w-64 mb-16 animate-pulse" />
        <div className="border border-ink/10 p-8 mb-16 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-5 border-b border-ink/10 flex justify-between">
              <div className="h-4 bg-ink/5 w-24" />
              <div className="h-4 bg-ink/5 w-48" />
            </div>
          ))}
        </div>
        <div className="h-8 bg-ink/5 w-48 mb-8 animate-pulse" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-ink/10 p-6 mb-4 animate-pulse">
            <div className="h-4 bg-ink/5 w-full" />
          </div>
        ))}
      </main>
    );
  }

  return (
    <main className="px-8 md:px-20 pt-36 pb-24 min-h-screen">
      <h1 className="font-playfair text-5xl md:text-6xl text-ink mb-14">your profile.</h1>

      {/* Profile details */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-inter text-xs tracking-widest uppercase text-ink/40">account details</h2>
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
            <div className="p-8 flex flex-col gap-6">
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

              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 border border-ink/20 font-inter text-xs tracking-widest uppercase text-ink/50 hover:border-ink hover:text-ink transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-burgundy text-cream font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
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
                <div key={label} className="flex justify-between items-center px-8 py-5 border-b border-ink/10 last:border-b-0">
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

      {/* Preferences */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-inter text-xs tracking-widest uppercase text-ink/40">my preferences</h2>
          {savingPrefs && <span className="font-inter text-xs text-ink/30">saving...</span>}
        </div>
        <p className="font-inter text-sm text-ink/50 mb-4">select what you love and we&apos;ll personalise your homepage.</p>
        <PreferencePicker selected={preferences} onChange={handlePreferenceChange} />
      </section>

      {/* Past orders */}
      <section>
        <h2 className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-6">past orders</h2>

        {orders.length === 0 ? (
          <div className="border border-ink/10 px-8 py-16 text-center">
            <p className="font-playfair text-2xl text-ink mb-2">no orders yet.</p>
            <p className="font-inter text-sm text-ink/40">your order history will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="border border-ink/10">
                  {/* Order header — always visible */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full flex flex-wrap items-center justify-between gap-4 px-8 py-5 text-left hover:bg-ink/2 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-6">
                      <span className="font-playfair text-lg text-ink">{order.order_number}</span>
                      <span className="font-inter text-xs text-ink/40">{formatDate(order.created_at)}</span>
                      <span className={`font-inter text-xs tracking-widest uppercase border px-2 py-0.5 ${STATUS_STYLES[order.status] ?? "text-ink/50 border-ink/20"}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-inter text-sm text-burgundy font-medium">${Number(order.total_amount).toFixed(2)}</span>
                      <span className="font-inter text-xs text-ink/30">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {/* Order breakdown — expanded */}
                  {isExpanded && (
                    <div className="border-t border-ink/10 px-8 pb-8 pt-6">
                      {/* Items */}
                      <div className="mb-6">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-5 py-4 border-b border-ink/10 last:border-b-0">
                            {item.products?.image_url && (
                              <div className="relative w-14 h-14 shrink-0 bg-[#E8E0D0]">
                                <Image
                                  src={item.products.image_url}
                                  alt={item.products.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-inter text-sm text-ink">{item.products?.name ?? "product"}</p>
                              {item.custom_notes && (
                                <p className="font-inter text-xs text-ink/40 italic mt-0.5">note: {item.custom_notes}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-inter text-sm text-ink">× {item.quantity}</p>
                              <p className="font-inter text-xs text-ink/40">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pickup + totals */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="border border-ink/10 p-5">
                          <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">pickup details</p>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between font-inter text-sm">
                              <span className="text-ink/50">date</span>
                              <span className="text-ink">{order.pickup_date}</span>
                            </div>
                            <div className="flex justify-between font-inter text-sm">
                              <span className="text-ink/50">time</span>
                              <span className="text-ink">{order.pickup_time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-ink/10 p-5">
                          <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">summary</p>
                          <div className="flex justify-between items-baseline">
                            <span className="font-inter text-xs text-ink/50">total</span>
                            <span className="font-playfair text-2xl text-burgundy">${Number(order.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 border border-ink/10 p-5">
                          <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-2">order notes</p>
                          <p className="font-inter text-sm text-ink/70">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Change password */}
      <section className="mb-20">
        <button
          onClick={() => { setShowChangePw((v) => !v); setPwErrors({}); setPwError(""); }}
          className="flex items-center gap-3 font-inter text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors"
        >
          <span>change password</span>
          <span className="text-ink/30">{showChangePw ? "▲" : "▼"}</span>
        </button>

        {pwSuccess && <p className="font-inter text-xs text-burgundy mt-3">password updated successfully.</p>}

        {showChangePw && (
          <div className="mt-6 border border-ink/10 p-8 flex flex-col gap-5">
            {[
              { id: "current", label: "current password",  placeholder: "••••••••" },
              { id: "newPw",   label: "new password",      placeholder: "min. 8 characters" },
              { id: "confirm", label: "confirm password",  placeholder: "••••••••" },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
                  {label}<span className="text-burgundy ml-0.5">*</span>
                </label>
                <input
                  type="password"
                  value={pwForm[id as keyof typeof pwForm]}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPwForm((p) => ({ ...p, [id]: val }));
                    if (id === "confirm") {
                      if (val && val !== pwForm.newPw) setPwErrors((p) => ({ ...p, confirm: "passwords do not match" }));
                      else setPwErrors((p) => ({ ...p, confirm: undefined }));
                    } else {
                      setPwErrors((p) => ({ ...p, [id]: undefined }));
                    }
                  }}
                  placeholder={placeholder}
                  className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
                />
                {pwErrors[id as keyof typeof pwErrors] && (
                  <p className="font-inter text-xs text-burgundy mt-1">{pwErrors[id as keyof typeof pwErrors]}</p>
                )}
              </div>
            ))}

            {pwError && <p className="font-inter text-xs text-burgundy">{pwError}</p>}

            <div className="flex gap-4 pt-1">
              <button
                onClick={() => { setShowChangePw(false); setPwForm({ current: "", newPw: "", confirm: "" }); setPwErrors({}); setPwError(""); }}
                className="px-8 py-3 border border-ink/20 font-inter text-xs tracking-widest uppercase text-ink/50 hover:border-ink hover:text-ink transition-colors"
              >
                cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="px-8 py-3 bg-burgundy text-cream font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
              >
                {pwSaving ? "saving..." : "update password"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="mt-20 pt-10 border-t border-ink/10">
        <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">danger zone</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="font-inter text-xs tracking-widest uppercase text-burgundy border border-burgundy px-6 py-3 hover:bg-burgundy hover:text-cream transition-colors"
        >
          delete account
        </button>
      </section>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </main>
  );
}
