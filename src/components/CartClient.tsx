"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-6 py-8 border-b border-ink/10">
      <div className="w-24 h-24 bg-[#E8E0D0] shrink-0" />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h3 className="font-playfair text-xl text-ink">{item.name}</h3>
          <button
            onClick={() => removeItem(item.productId)}
            className="font-inter text-ink/30 hover:text-burgundy transition-colors text-lg leading-none shrink-0"
            aria-label="remove item"
          >
            ×
          </button>
        </div>
        <p className="font-inter text-sm text-burgundy mb-3">{item.price} each</p>
        {item.customNotes && (
          <p className="font-inter text-xs text-ink/50 italic mb-3">
            note: {item.customNotes}
          </p>
        )}
        <div className="flex items-center w-fit border border-ink/20">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="w-9 h-9 flex items-center justify-center font-inter text-lg text-ink hover:bg-ink/5 transition-colors"
            aria-label="decrease quantity"
          >
            −
          </button>
          <span className="w-9 h-9 flex items-center justify-center font-inter text-sm text-ink border-x border-ink/20">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center font-inter text-lg text-ink hover:bg-ink/5 transition-colors"
            aria-label="increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <p className="font-playfair text-xl text-ink shrink-0">
        ${(item.priceValue * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}

export default function CartClient() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="font-playfair text-4xl text-ink mb-4">nothing here yet.</p>
        <Link
          href="/menu"
          className="font-inter text-sm tracking-widest uppercase text-burgundy hover:text-ink transition-colors"
        >
          browse menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
      {/* Left: order items */}
      <div>
        <div className="border-t border-ink/10">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>
        <Link
          href="/menu"
          className="inline-block font-inter text-xs tracking-widest uppercase text-ink/50 hover:text-burgundy transition-colors mt-8"
        >
          ← continue shopping
        </Link>
      </div>

      {/* Right: order summary — coming in next commit */}
      <div />
    </div>
  );
}
