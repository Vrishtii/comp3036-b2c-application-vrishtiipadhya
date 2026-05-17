"use client";

import { useState } from "react";
import Link from "next/link";
import { products, type Category } from "@/data/products";

type Filter = "all" | Category;

const filters: { label: string; value: Filter }[] = [
  { label: "all", value: "all" },
  { label: "brownies", value: "brownies" },
  { label: "cookies", value: "cookies" },
  { label: "loaves", value: "loaves" },
];

export default function MenuClient() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const visible = products.filter((p) => {
    const matchesCategory = activeFilter === "all" || p.category === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                {product.category}
              </p>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-playfair text-xl text-ink">{product.name}</h3>
                <span className="font-inter text-sm text-burgundy font-medium ml-4 shrink-0">
                  {product.price}
                </span>
              </div>
              <p className="font-inter text-sm text-ink/55 leading-relaxed mb-8 flex-1">
                {product.description}
              </p>
              <button className="border border-burgundy text-burgundy py-3 font-inter text-xs tracking-widest uppercase hover:bg-burgundy hover:text-cream transition-colors">
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
