"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  custom_notes: string | null;
  products: { id: string; name: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  pickup_date: string;
  pickup_time: string;
  total_amount: number;
  notes: string | null;
  order_items: OrderItem[];
}

const supabase = createClient();

export default function OrderConfirmation() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.replace("/login"); return; }
    if (!orderNumber) { router.replace("/"); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }

      const res = await fetch(`/api/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) setOrder(await res.json());
      setLoading(false);
    });
  }, [isLoggedIn, orderNumber, router]);

  if (loading) {
    return (
      <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen flex items-center justify-center">
        <p className="font-inter text-sm text-ink/40">loading your order...</p>
      </main>
    );
  }

  if (!order) return null;

  const firstName = user?.name.split(" ")[0].toLowerCase() ?? "there";

  return (
    <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen">
      <div className="max-w-xl mb-16">
        <p className="font-inter text-xs tracking-widest uppercase text-burgundy mb-4">order confirmed</p>
        <h1 className="font-playfair text-6xl md:text-7xl text-ink mb-4">order placed!</h1>
        <p className="font-inter text-base text-ink/55 leading-relaxed">
          thanks {firstName}, your order is in. we&apos;ll have it ready for pickup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
        <div>
          <div className="border border-ink/10 p-6 mb-10 flex items-center justify-between">
            <span className="font-inter text-xs tracking-widest uppercase text-ink/40">order number</span>
            <span className="font-playfair text-2xl text-burgundy">{order.order_number}</span>
          </div>

          <h2 className="font-playfair text-2xl text-ink mb-6">your order.</h2>
          <div className="border-t border-ink/10">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between gap-6 py-6 border-b border-ink/10">
                <div>
                  <p className="font-playfair text-lg text-ink mb-1">{item.products?.name}</p>
                  <p className="font-inter text-xs text-ink/40 mb-1">qty: {item.quantity}</p>
                  {item.custom_notes && (
                    <p className="font-inter text-xs text-ink/40 italic">note: {item.custom_notes}</p>
                  )}
                </div>
                <p className="font-inter text-sm text-ink shrink-0">
                  ${(item.price_at_purchase * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-inter text-sm py-6 border-b border-ink/10">
            <span className="text-ink/50 tracking-widest uppercase">pickup</span>
            <span className="text-ink/50">free</span>
          </div>
          <div className="flex justify-between items-baseline pt-6">
            <span className="font-inter text-xs tracking-widest uppercase text-ink/50">total</span>
            <span className="font-playfair text-3xl text-burgundy">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-ink/10 p-6">
            <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">pickup details</p>
            <div className="flex flex-col gap-3">
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

          {order.notes && (
            <div className="border border-ink/10 p-6">
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">notes</p>
              <p className="font-inter text-sm text-ink">{order.notes}</p>
            </div>
          )}

          <Link
            href="/orders"
            className="w-full block text-center bg-burgundy text-cream py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
          >
            view my orders →
          </Link>
          <Link
            href="/"
            className="w-full block text-center border border-ink/20 text-ink py-4 font-inter text-xs tracking-widest uppercase hover:border-burgundy hover:text-burgundy transition-colors"
          >
            back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
