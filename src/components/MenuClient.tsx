"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  categories: { name: string } | null;
}

type Filter = "all" | "Brownies" | "Cookies" | "Loaves";

const filters: { label: string; value: Filter }[] = [
  { label: "all", value: "all" },
  { label: "brownies", value: "Brownies" },
  { label: "cookies", value: "Cookies" },
  { label: "loaves", value: "Loaves" },
];

export default function MenuClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else setError("failed to load products");
      })
      .catch(() => setError("failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const visible = products.filter((p) => {
    const matchesCategory =
      activeFilter === "all" || p.categories?.name === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="aspect-square bg-ink/5 mb-5" />
            <div className="h-3 bg-ink/5 w-20 mb-3" />
            <div className="h-5 bg-ink/5 w-3/4 mb-2" />
            <div className="h-4 bg-ink/5 w-full mb-1" />
            <div className="h-4 bg-ink/5 w-2/3 mb-8" />
            <div className="h-10 bg-ink/5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="font-playfair text-4xl text-ink mb-4">something went wrong.</p>
        <p className="font-inter text-sm text-ink/50">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <input
          type="text"
          placeholder="search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border border-ink/20 px-5 py-3 font-inter text-sm text-ink placeholder-ink/40 focus:outline-none focus:border-burgundy transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-5 py-3 font-inter text-xs tracking-widest uppercase transition-colors ${
                activeFilter === f.value
                  ? "bg-burgundy text-cream"
                  : "border border-ink/20 text-ink hover:border-burgundy hover:text-burgundy"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {visible.map((product) => (
            <div key={product.id} className="flex flex-col">
              <Link href={`/menu/${product.id}`} className="group block mb-5">
                <div className="aspect-square bg-[#E8E0D0] group-hover:opacity-85 transition-opacity" />
              </Link>
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-2">
                {product.categories?.name?.toLowerCase() ?? ""}
              </p>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-playfair text-xl text-ink">{product.name}</h3>
                <span className="font-inter text-sm text-burgundy font-medium ml-4 shrink-0">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
              <p className="font-inter text-sm text-ink/55 leading-relaxed mb-8 flex-1">
                {product.description}
              </p>
              <button
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: `$${Number(product.price).toFixed(2)}`,
                    priceValue: Number(product.price),
                    quantity: 1,
                    customNotes: "",
                  })
                }
                className="border border-burgundy text-burgundy py-3 font-inter text-xs tracking-widest uppercase hover:bg-burgundy hover:text-cream transition-colors"
              >
                add to cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-playfair text-4xl text-ink mb-4">nothing found.</p>
          <p className="font-inter text-sm text-ink/50">try something else.</p>
        </div>
      )}
    </>
  );
}
