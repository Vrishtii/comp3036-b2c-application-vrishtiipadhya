"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/context/CartContext";

const STEPS = ["order summary", "your details", "payment"] as const;

interface Props {
  pickupDate: string;
  pickupTime: string;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-3 font-inter text-xs tracking-widest uppercase mb-16 flex-wrap">
      {STEPS.map((label, i) => (
        <span key={label} className="flex items-center gap-3">
          <span className={current === i + 1 ? "text-burgundy" : "text-ink/30"}>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="text-ink/20">→</span>}
        </span>
      ))}
    </div>
  );
}

function OrderSummaryStep({
  items,
  subtotal,
  pickupDate,
  pickupTime,
  onNext,
}: {
  items: CartItem[];
  subtotal: number;
  pickupDate: string;
  pickupTime: string;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="font-playfair text-3xl text-ink mb-8">order summary.</h2>

      <div className="border-t border-ink/10">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between gap-6 py-6 border-b border-ink/10">
            <div>
              <p className="font-playfair text-lg text-ink mb-1">{item.name}</p>
              <p className="font-inter text-xs text-ink/40 mb-1">qty: {item.quantity}</p>
              {item.customNotes && (
                <p className="font-inter text-xs text-ink/40 italic">note: {item.customNotes}</p>
              )}
            </div>
            <p className="font-inter text-sm text-ink shrink-0">
              ${(item.priceValue * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-inter text-sm text-ink py-6 border-b border-ink/10">
        <span className="text-ink/50 tracking-widest uppercase">subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {/* Pickup details */}
      <div className="mt-8 mb-12 p-6 border border-ink/10">
        <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">pickup details</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-inter text-sm">
            <span className="text-ink/50">date</span>
            <span className="text-ink">{pickupDate || "—"}</span>
          </div>
          <div className="flex justify-between font-inter text-sm">
            <span className="text-ink/50">time</span>
            <span className="text-ink">{pickupTime || "—"}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="bg-burgundy text-cream px-10 py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
      >
        continue →
      </button>
    </div>
  );
}

function DetailsStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="font-playfair text-3xl text-ink mb-8">your details.</h2>
      <p className="font-inter text-sm text-ink/40 mb-8">coming in next step.</p>
      <div className="flex gap-4">
        <button onClick={onBack} className="font-inter text-xs tracking-widest uppercase text-ink/40 hover:text-burgundy transition-colors">
          ← back
        </button>
        <button onClick={onNext} className="bg-burgundy text-cream px-10 py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors">
          continue →
        </button>
      </div>
    </div>
  );
}

function PaymentStep({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <h2 className="font-playfair text-3xl text-ink mb-8">payment.</h2>
      <p className="font-inter text-sm text-ink/40 mb-8">coming in next step.</p>
      <button onClick={onBack} className="font-inter text-xs tracking-widest uppercase text-ink/40 hover:text-burgundy transition-colors">
        ← back
      </button>
    </div>
  );
}

function OrderSummaryPanel({
  items,
  subtotal,
}: {
  items: CartItem[];
  subtotal: number;
}) {
  return (
    <div className="lg:sticky lg:top-32 self-start border border-ink/10 p-8">
      <h2 className="font-playfair text-2xl text-ink mb-6">your order.</h2>
      <div className="border-t border-ink/10">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between gap-4 py-4 border-b border-ink/10">
            <div>
              <p className="font-inter text-sm text-ink">{item.name}</p>
              <p className="font-inter text-xs text-ink/40">× {item.quantity}</p>
            </div>
            <p className="font-inter text-sm text-ink shrink-0">
              ${(item.priceValue * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-inter text-sm text-ink py-4 border-b border-ink/10">
        <span className="text-ink/50 tracking-widest uppercase text-xs">subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-inter text-sm text-ink py-4 border-b border-ink/10">
        <span className="text-ink/50 tracking-widest uppercase text-xs">pickup</span>
        <span className="text-ink/50">free</span>
      </div>
      <div className="flex justify-between items-baseline pt-6 mb-8">
        <span className="font-inter text-xs tracking-widest uppercase text-ink/50">total</span>
        <span className="font-playfair text-3xl text-burgundy">${subtotal.toFixed(2)}</span>
      </div>

      <button
        disabled
        className="w-full py-4 font-inter text-xs tracking-widest uppercase bg-ink/10 text-ink/30 cursor-not-allowed"
      >
        place order
      </button>
      <p className="font-inter text-xs text-ink/30 text-center mt-3">
        complete all steps to place your order
      </p>
    </div>
  );
}

export default function CheckoutClient({ pickupDate, pickupTime }: Props) {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items, router]);

  if (items.length === 0) return null;

  return (
    <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen">
      <h1 className="font-playfair text-6xl md:text-7xl text-ink mb-8">checkout.</h1>
      <StepIndicator current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
        <div>
          {step === 1 && (
            <OrderSummaryStep
              items={items}
              subtotal={subtotal}
              pickupDate={pickupDate}
              pickupTime={pickupTime}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <DetailsStep onBack={() => setStep(1)} onNext={() => setStep(3)} />
          )}
          {step === 3 && <PaymentStep onBack={() => setStep(2)} />}
        </div>

        <OrderSummaryPanel items={items} subtotal={subtotal} />
      </div>
    </main>
  );
}
