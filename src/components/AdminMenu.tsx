"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  is_available: boolean;
  is_seasonal: boolean;
  categories: { name: string } | null;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_available: boolean;
  is_seasonal: boolean;
}

const EMPTY_FORM: FormState = {
  name: "", description: "", price: "",
  category_id: "", is_available: true, is_seasonal: false,
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-burgundy" : "bg-ink/20"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-cream transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
      <span className="font-inter text-xs tracking-widest uppercase text-ink/50">{label}</span>
    </label>
  );
}

const supabase = createClient();

export default function AdminMenu() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from("categories").select("id, name").order("name");
      if (cats) setCategories(cats);

      const res = await fetch("/api/products");
      if (res.ok) setProducts(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? "" });
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setModal("add");
  }

  function openEdit(p: AdminProduct) {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category_id: p.category_id,
      is_available: p.is_available,
      is_seasonal: p.is_seasonal,
    });
    setEditingId(p.id);
    setErrors({});
    setImageFile(null);
    setImagePreview(p.image_url);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(filename, file);
    setUploading(false);
    if (error) return null;
    const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
    return data.publicUrl;
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "name is required";
    if (!form.description.trim()) e.description = "description is required";
    if (!form.price.trim()) e.price = "price is required";
    else if (isNaN(parseFloat(form.price))) e.price = "enter a valid price";
    if (!form.category_id) e.category_id = "category is required";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    const token = await getToken();
    if (!token) { setSaving(false); return; }

    let image_url: string | null = null;
    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id,
      is_available: form.is_available,
      is_seasonal: form.is_seasonal,
    };
    if (image_url) body.image_url = image_url;

    const url = modal === "edit" && editingId
      ? `/api/admin/products/${editingId}`
      : "/api/admin/products";

    const res = await fetch(url, {
      method: modal === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const saved: AdminProduct = await res.json();
      if (modal === "add") {
        setProducts((prev) => [...prev, saved]);
      } else {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      }
      closeModal();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    }
  }

  function field(key: keyof FormState, label: string, type = "text", placeholder = "", required = false) {
    const value = form[key];
    return (
      <div>
        <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">{label}{required && <span className="text-burgundy ml-0.5">*</span>}</label>
        {key === "description" ? (
          <textarea
            value={value as string}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder} rows={2}
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors resize-none"
          />
        ) : (
          <input
            type={type} value={value as string}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
        )}
        {errors[key] && <p className="font-inter text-xs text-burgundy mt-1">{errors[key]}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-playfair text-5xl text-ink mb-10">menu management.</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-ink/10 animate-pulse">
              <div className="aspect-square bg-ink/5" />
              <div className="p-5">
                <div className="h-4 bg-ink/5 w-3/4 mb-2" />
                <div className="h-3 bg-ink/5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <h1 className="font-playfair text-5xl text-ink">menu management.</h1>
        <button
          onClick={openAdd}
          className="bg-burgundy text-cream px-6 py-3 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
        >
          + add product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className={`border flex flex-col ${p.is_available ? "border-ink/10" : "border-ink/5 opacity-50"}`}>
            <div className="aspect-square bg-[#E8E0D0] relative">
              {p.image_url && (
                <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
              )}
              {p.is_seasonal && (
                <span className="absolute top-3 left-3 font-inter text-[10px] tracking-widest uppercase bg-burgundy text-cream px-2 py-1">seasonal</span>
              )}
              {!p.is_available && (
                <span className="absolute top-3 right-3 font-inter text-[10px] tracking-widest uppercase bg-ink/20 text-ink px-2 py-1">hidden</span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-1">
                {p.categories?.name?.toLowerCase() ?? ""}
              </p>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-playfair text-lg text-ink">{p.name}</h3>
                <span className="font-inter text-sm text-burgundy ml-2 shrink-0">${Number(p.price).toFixed(2)}</span>
              </div>
              <p className="font-inter text-xs text-ink/50 leading-relaxed mb-5 flex-1">{p.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 border border-ink/20 text-ink/60 py-2 font-inter text-xs tracking-widest uppercase hover:border-burgundy hover:text-burgundy transition-colors"
                >
                  edit
                </button>
                {confirmDelete === p.id ? (
                  <div className="flex gap-2 flex-1">
                    <button onClick={() => handleDelete(p.id)} className="flex-1 bg-burgundy text-cream py-2 font-inter text-xs tracking-widest uppercase">confirm</button>
                    <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-ink/20 text-ink/50 py-2 font-inter text-xs">cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="flex-1 border border-ink/20 text-ink/40 py-2 font-inter text-xs tracking-widest uppercase hover:border-burgundy hover:text-burgundy transition-colors"
                  >
                    delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-8">
          <div className="bg-cream w-full max-w-lg border border-ink/10 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-playfair text-3xl text-ink mb-8">
              {modal === "add" ? "add product." : "edit product."}
            </h2>
            <div className="flex flex-col gap-5 mb-6">
              {field("name", "product name", "text", "e.g. Dark Chocolate Brownie", true)}
              <div>
                <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">category<span className="text-burgundy ml-0.5">*</span></label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full bg-cream border border-ink/20 px-4 py-3 font-inter text-sm text-ink focus:outline-none focus:border-burgundy transition-colors"
                >
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="font-inter text-xs text-burgundy mt-1">{errors.category_id}</p>}
              </div>
              {field("description", "description", "text", "short description", true)}
              {field("price", "price", "text", "e.g. 4.50", true)}
              <div>
                <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">image</label>
                {imagePreview ? (
                  <div className="relative w-full aspect-square mb-2">
                    <Image src={imagePreview} alt="preview" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-ink text-cream font-inter text-xs px-2 py-1"
                    >
                      remove
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-24 bg-[#E8E0D0] flex items-center justify-center border border-ink/20 cursor-pointer block">
                    <span className="font-inter text-xs text-ink/40">click to upload image</span>
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                )}
                {uploading && <p className="font-inter text-xs text-ink/50 mt-1">uploading...</p>}
              </div>
              <Toggle checked={form.is_available} onChange={(v) => setForm((f) => ({ ...f, is_available: v }))} label="available on menu" />
              <Toggle checked={form.is_seasonal} onChange={(v) => setForm((f) => ({ ...f, is_seasonal: v }))} label="seasonal item" />
            </div>
            <div className="flex gap-4">
              <button onClick={closeModal} className="flex-1 border border-ink/20 text-ink/50 py-3 font-inter text-xs tracking-widest uppercase hover:border-burgundy hover:text-burgundy transition-colors">
                cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-burgundy text-cream py-3 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50">
                {saving ? "saving..." : "save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
