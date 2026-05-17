"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";

const PICKUP_TIMES = [
  "10:00am", "11:00am", "12:00pm",
  "1:00pm",  "2:00pm",  "3:00pm", "4:00pm",
];

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

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
  const { items, subtotal } = useCart();
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const router = useRouter();

  const canCheckout = pickupDate !== "" && pickupTime !== "";

  function handleCheckout() {
    if (!canCheckout) return;
    router.push(`/checkout?date=${pickupDate}&time=${encodeURIComponent(pickupTime)}`);
  }

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

      {/* Right: order summary */}
      <div className="lg:sticky lg:top-32 self-start border border-ink/10 p-8 flex flex-col gap-6">
        <h2 className="font-playfair text-2xl text-ink">order summary.</h2>

        <div className="flex justify-between font-inter text-sm text-ink border-t border-ink/10 pt-6">
          <span className="tracking-widest uppercase text-ink/50">subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>

        <p className="font-inter text-xs text-ink/40">
          pickup only · made fresh to order
        </p>

        <hr className="border-ink/10" />

        {/* Pickup details */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
              pickup date
            </label>
            <input
              type="date"
              min={tomorrow()}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink focus:outline-none focus:border-burgundy transition-colors"
            />
          </div>
          <div>
            <label className="block font-inter text-xs tracking-widest uppercase text-ink/50 mb-2">
              pickup time
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-cream border border-ink/20 px-4 py-3 font-inter text-sm text-ink focus:outline-none focus:border-burgundy transition-colors"
            >
              <option value="">select a time</option>
              {PICKUP_TIMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={!canCheckout}
          className={`w-full py-4 font-inter text-xs tracking-widest uppercase transition-colors ${
            canCheckout
              ? "bg-burgundy text-cream hover:bg-ink"
              : "bg-ink/10 text-ink/30 cursor-not-allowed"
          }`}
        >
          proceed to checkout
        </button>

        {!canCheckout && (
          <p className="font-inter text-xs text-ink/40 text-center -mt-2">
            select a pickup date and time to continue
          </p>
        )}
      </div>
    </div>
  );
}
