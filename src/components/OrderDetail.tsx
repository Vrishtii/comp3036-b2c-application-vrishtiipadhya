"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

type OrderStatus = "pending" | "confirmed" | "ready" | "completed";

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
  status: OrderStatus;
  pickup_date: string;
  pickup_time: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const TIMELINE: { key: OrderStatus; label: string }[] = [
  { key: "pending",   label: "order placed" },
  { key: "confirmed", label: "confirmed" },
  { key: "ready",     label: "ready for pickup" },
  { key: "completed", label: "completed" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, ready: 2, completed: 3,
};

function StatusTimeline({ status }: { status: OrderStatus }) {
  const current = STATUS_INDEX[status];
  return (
    <div className="flex items-start gap-0 w-full">
      {TIMELINE.map((step, i) => {
        const done = i <= current;
        const isLast = i === TIMELINE.length - 1;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div className={`w-3 h-3 rounded-full shrink-0 transition-colors ${done ? "bg-burgundy" : "bg-ink/20"}`} />
              {!isLast && <div className={`h-px flex-1 transition-colors ${i < current ? "bg-burgundy" : "bg-ink/20"}`} />}
            </div>
            <p className={`font-inter text-xs mt-2 text-left w-full pr-2 ${done ? "text-ink" : "text-ink/30"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

const supabase = createClient();

export default function OrderDetail({ orderNumber }: { orderNumber: string }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace(`/login?redirect=/orders/${orderNumber}`); return; }

      const res = await fetch(`/api/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) setOrder(await res.json());
      else setNotFound(true);
      setLoading(false);
    });
  }, [orderNumber, router]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-ink/5 w-48" />
        <div className="h-16 bg-ink/5 w-64" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="font-playfair text-4xl text-ink mb-4">order not found.</p>
        <Link href="/orders" className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors">
          ← back to orders
        </Link>
      </div>
    );
  }

  const placed = new Date(order.created_at);
  const placedFormatted = placed.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const placedTime = placed.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <Link href="/orders" className="inline-block font-inter text-xs tracking-widest uppercase text-ink/50 hover:text-burgundy transition-colors mb-12">
        ← back to orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-16">
        <div>
          <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-2">order number</p>
          <h1 className="font-playfair text-5xl md:text-6xl text-burgundy">{order.order_number}</h1>
        </div>
        <p className="font-inter text-sm text-ink/40">placed {placedFormatted} at {placedTime}</p>
      </div>

      <div className="mb-16">
        <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-6">order status</p>
        <StatusTimeline status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-16">
        <div>
          <h2 className="font-playfair text-2xl text-ink mb-6">items.</h2>
          <div className="border-t border-ink/10">
            {order.order_items.map((item) => (
              <div key={item.id} className="py-6 border-b border-ink/10">
                <div className="flex justify-between mb-1">
                  <p className="font-playfair text-lg text-ink">{item.products?.name}</p>
                  <p className="font-inter text-sm text-ink">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                </div>
                <p className="font-inter text-xs text-ink/40 mb-1">
                  qty: {item.quantity} · ${Number(item.price_at_purchase).toFixed(2)} each
                </p>
                {item.custom_notes && (
                  <p className="font-inter text-xs text-ink/40 italic">note: {item.custom_notes}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between font-inter text-sm py-4 border-b border-ink/10">
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

          <a
            href={`mailto:hello@crave.com?subject=Help with order ${order.order_number}`}
            className="font-inter text-xs tracking-widest uppercase text-ink/40 hover:text-burgundy transition-colors text-center"
          >
            need help? contact us →
          </a>
        </div>
      </div>
    </div>
  );
}
