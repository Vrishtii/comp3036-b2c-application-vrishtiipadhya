"use client";

import { useEffect, useState } from "react";
import { products as hardcoded, type Category } from "@/data/products";

interface AdminProduct {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: string;
  available: boolean;
  seasonal: boolean;
}

const STORAGE_KEY = "crave_admin_products";
const CATEGORIES: Category[] = ["brownies", "cookies", "loaves"];

const EMPTY_FORM: Omit<AdminProduct, "id"> = {
  name: "", category: "brownies", description: "",
  price: "", available: true, seasonal: false,
};

function useAdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        const initial = hardcoded.map((p) => ({ ...p, available: true, seasonal: false }));
        setProducts(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch { setProducts([]); }
  }, []);

  function save(updated: AdminProduct[]) {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return {
    products,
    add:    (p: AdminProduct) => save([...products, p]),
    update: (id: string, changes: Partial<AdminProduct>) =>
      save(products.map((p) => (p.id === id ? { ...p, ...changes } : p))),
    remove: (id: string) => save(products.filter((p) => p.id !== id)),
  };
}

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

export default function AdminMenu() {
  const { products, add, update, remove } = useAdminProducts();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AdminProduct, "id">>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminProduct, string>>>({});

  function openAdd() {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal("add");
  }

  function openEdit(p: AdminProduct) {
    const { id: _, ...rest } = p;
    void _;
    setForm(rest);
    setEditingId(p.id);
    setErrors({});
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "name is required";
    if (!form.description.trim()) e.description = "description is required";
    if (!form.price.trim()) e.price = "price is required";
    else if (isNaN(parseFloat(form.price.replace("$", ""))))
      e.price = "enter a valid price";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const price = form.price.startsWith("$") ? form.price : `$${form.price}`;
    if (modal === "add") {
      add({ ...form, price, id: `product-${Date.now()}` });
    } else if (editingId) {
      update(editingId, { ...form, price });
    }
    closeModal();
  }

  function field(
    key: keyof typeof form,
    label: string,
    type: string = "text",
    placeholder: string = ""
  ) {
    return (
      <div>
        <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">{label}</label>
        {key === "description" ? (
          <textarea
            value={form[key] as string}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors resize-none"
          />
        ) : (
          <input
            type={type}
            value={form[key] as string}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
        )}
        {errors[key] && <p className="font-inter text-xs text-burgundy mt-1">{errors[key]}</p>}
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
          <div key={p.id} className={`border flex flex-col ${p.available ? "border-ink/10" : "border-ink/5 opacity-50"}`}>
            <div className="aspect-square bg-[#E8E0D0] relative">
              {p.seasonal && (
                <span className="absolute top-3 left-3 font-inter text-[10px] tracking-widest uppercase bg-burgundy text-cream px-2 py-1">
                  seasonal
                </span>
              )}
              {!p.available && (
                <span className="absolute top-3 right-3 font-inter text-[10px] tracking-widest uppercase bg-ink/20 text-ink px-2 py-1">
                  hidden
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-1">{p.category}</p>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-playfair text-lg text-ink">{p.name}</h3>
                <span className="font-inter text-sm text-burgundy ml-2 shrink-0">{p.price}</span>
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
                    <button
                      onClick={() => { remove(p.id); setConfirmDelete(null); }}
                      className="flex-1 bg-burgundy text-cream py-2 font-inter text-xs tracking-widest uppercase"
                    >
                      confirm
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 border border-ink/20 text-ink/50 py-2 font-inter text-xs"
                    >
                      cancel
                    </button>
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-8">
          <div className="bg-cream w-full max-w-lg border border-ink/10 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-playfair text-3xl text-ink mb-8">
              {modal === "add" ? "add product." : "edit product."}
            </h2>
            <div className="flex flex-col gap-5 mb-6">
              {field("name", "product name", "text", "e.g. Dark Chocolate Brownie")}
              <div>
                <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className="w-full bg-cream border border-ink/20 px-4 py-3 font-inter text-sm text-ink focus:outline-none focus:border-burgundy transition-colors"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {field("description", "description", "text", "short description")}
              {field("price", "price", "text", "e.g. 4.50")}
              <div className="border border-ink/10 p-4 rounded">
                <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-1">image</p>
                <div className="w-full h-24 bg-[#E8E0D0] flex items-center justify-center">
                  <p className="font-inter text-xs text-ink/30">image upload coming with Supabase</p>
                </div>
              </div>
              <Toggle checked={form.available} onChange={(v) => setForm((f) => ({ ...f, available: v }))} label="available on menu" />
              <Toggle checked={form.seasonal} onChange={(v) => setForm((f) => ({ ...f, seasonal: v }))} label="seasonal item" />
            </div>
            <div className="flex gap-4">
              <button
                onClick={closeModal}
                className="flex-1 border border-ink/20 text-ink/50 py-3 font-inter text-xs tracking-widest uppercase hover:border-burgundy hover:text-burgundy transition-colors"
              >
                cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-burgundy text-cream py-3 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
              >
                save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
