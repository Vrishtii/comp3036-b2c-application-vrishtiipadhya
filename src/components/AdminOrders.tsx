"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OrderStatus = "pending" | "confirmed" | "ready" | "completed";
type StatusFilter = "all" | OrderStatus;

const STATUSES: OrderStatus[] = ["pending", "confirmed", "ready", "completed"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-ink/10 text-ink/50",
  confirmed: "bg-yellow-100 text-yellow-700",
  ready:     "bg-green-100 text-green-700",
  completed: "bg-burgundy/10 text-burgundy",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "pending", confirmed: "confirmed",
  ready: "ready for pickup", completed: "completed",
};

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
  profiles: { id: string; full_name: string; email: string } | null;
  order_items: OrderItem[];
}

const supabase = createClient();

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) setOrders(await res.json());
      else setError("failed to load orders");
      setLoading(false);
    });
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  }

  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o.order_number.toLowerCase().includes(q) ||
        (o.profiles?.full_name ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchDate = !dateFilter || o.pickup_date === dateFilter;
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <h1 className="font-playfair text-5xl text-ink mb-10">orders.</h1>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="search by order # or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink focus:outline-none focus:border-burgundy transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", ...STATUSES] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 font-inter text-xs tracking-widest uppercase transition-colors ${
                statusFilter === s
                  ? "bg-burgundy text-cream"
                  : "border border-ink/20 text-ink hover:border-burgundy hover:text-burgundy"
              }`}
            >
              {s === "all" ? "all" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-ink/10 px-5 py-4 animate-pulse h-14" />
          ))}
        </div>
      ) : error ? (
        <p className="font-inter text-sm text-burgundy py-20 text-center">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="font-inter text-sm text-ink/40 py-20 text-center">no orders found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              isExpanded={expanded === order.id}
              onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
              onStatusChange={(status) => updateStatus(order.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order, isExpanded, onToggle, onStatusChange,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: OrderStatus) => void;
}) {
  return (
    <div className="border border-ink/10">
      <div
        className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 cursor-pointer hover:bg-ink/5 transition-colors"
        onClick={onToggle}
      >
        <div>
          <p className="font-inter text-sm text-burgundy">{order.order_number}</p>
          <p className="font-inter text-xs text-ink/40">{order.profiles?.full_name ?? "—"}</p>
        </div>
        <p className="font-inter text-xs text-ink/50">
          {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} · pickup {order.pickup_date}
        </p>
        <p className="font-inter text-sm text-ink">${Number(order.total_amount).toFixed(2)}</p>
        <p className="font-inter text-xs text-ink/40">{order.pickup_time}</p>
        <select
          value={order.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { e.stopPropagation(); onStatusChange(e.target.value as OrderStatus); }}
          className={`bg-transparent border-0 font-inter text-xs tracking-widest uppercase focus:outline-none cursor-pointer px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <span className="font-inter text-xs text-ink/30">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {isExpanded && (
        <div className="border-t border-ink/10 px-5 py-6 bg-ink/[0.02]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">items</p>
              <div className="flex flex-col gap-3">
                {order.order_items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between font-inter text-sm">
                      <span className="text-ink">{item.products?.name} <span className="text-ink/40">× {item.quantity}</span></span>
                      <span className="text-ink">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.custom_notes && (
                      <p className="font-inter text-xs text-ink/40 italic mt-1">note: {item.custom_notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">customer details</p>
              <div className="flex flex-col gap-2 font-inter text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/50">name</span>
                  <span className="text-ink">{order.profiles?.full_name ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/50">email</span>
                  <span className="text-ink">{order.profiles?.email ?? "—"}</span>
                </div>
                {order.notes && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50 shrink-0">notes</span>
                    <span className="text-ink text-right">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
