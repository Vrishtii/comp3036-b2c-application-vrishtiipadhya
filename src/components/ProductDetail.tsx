"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  categories: { name: string } | null;
}

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const priceDisplay = `$${Number(product.price).toFixed(2)}`;
  const categoryName = product.categories?.name?.toLowerCase() ?? "";

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: priceDisplay,
      priceValue: Number(product.price),
      quantity,
      customNotes: notes,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <main className="px-8 md:px-20 pt-32 pb-20">
      {/* Back link */}
      <Link
        href="/menu"
        className="inline-block font-inter text-xs tracking-widest uppercase text-ink/50 hover:text-burgundy transition-colors mb-12"
      >
        ← back to menu
      </Link>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-28">
        {/* Left: image */}
        <div className="aspect-square bg-[#E8E0D0] relative">
          {product.image_url && (
            <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
          )}
        </div>

        {/* Right: details */}
        <div className="flex flex-col justify-center">
          <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">
            {categoryName}
          </p>
          <h1 className="font-playfair text-4xl md:text-5xl text-ink mb-4 leading-tight">
            {product.name}
          </h1>
          <p className="font-inter text-base text-ink/60 leading-relaxed mb-6">
            {product.description}
          </p>
          <p className="font-playfair text-3xl text-burgundy mb-8">{priceDisplay}</p>

          <hr className="border-ink/10 mb-8" />

          {/* Quantity selector */}
          <div className="mb-6">
            <p className="font-inter text-xs tracking-widest uppercase text-ink/50 mb-3">
              quantity
            </p>
            <div className="flex items-center w-fit border border-ink/20">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center font-inter text-xl text-ink hover:bg-ink/5 transition-colors"
                aria-label="decrease quantity"
              >
                −
              </button>
              <span className="w-12 h-12 flex items-center justify-center font-inter text-sm text-ink border-x border-ink/20">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-12 h-12 flex items-center justify-center font-inter text-xl text-ink hover:bg-ink/5 transition-colors"
                aria-label="increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Custom notes */}
          <div className="mb-8">
            <label
              htmlFor="notes"
              className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-3"
            >
              special requests
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. nut allergy, birthday message"
              rows={3}
              className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors resize-none"
            />
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 font-inter text-xs tracking-widest uppercase transition-colors mb-4 ${
              added ? "bg-ink text-cream" : "bg-burgundy text-cream hover:bg-ink"
            }`}
          >
            {added ? "added to your order!" : "add to cart"}
          </button>
          <p className="font-inter text-xs text-ink/40 text-center">
            all items are made fresh to order. pickup only.
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="border-t border-ink/10 pt-20">
          <h2 className="font-playfair text-3xl md:text-4xl text-ink mb-12">
            you might also like.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {related.map((p) => (
              <Link key={p.id} href={`/menu/${p.id}`} className="group flex flex-col">
                <div className="aspect-square bg-[#E8E0D0] mb-4 group-hover:opacity-85 transition-opacity" />
                <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-2">
                  {p.categories?.name?.toLowerCase() ?? ""}
                </p>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-playfair text-xl text-ink group-hover:text-burgundy transition-colors">
                    {p.name}
                  </h3>
                  <span className="font-inter text-sm text-burgundy ml-4 shrink-0">
                    ${Number(p.price).toFixed(2)}
                  </span>
                </div>
                <p className="font-inter text-sm text-ink/50 leading-relaxed">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
