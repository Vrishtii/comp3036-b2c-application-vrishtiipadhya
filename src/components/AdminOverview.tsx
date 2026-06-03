"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type OrderStatus = "pending" | "confirmed" | "ready" | "completed";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-ink/10 text-ink/50",
  confirmed: "bg-yellow-100 text-yellow-700",
  ready:     "bg-green-100 text-green-700",
  completed: "bg-burgundy/10 text-burgundy",
};

interface OrderItem {
  id: string;
  quantity: number;
  products: { name: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  profiles: { full_name: string } | null;
  order_items: OrderItem[];
}

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`border p-6 ${highlight ? "border-burgundy/30 bg-burgundy/5" : "border-ink/10"}`}>
      <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">{label}</p>
      <p className={`font-playfair text-4xl ${highlight ? "text-burgundy" : "text-ink"}`}>{value}</p>
    </div>
  );
}

const supabase = createClient();

export default function AdminOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [ordersRes, customersRes] = await Promise.all([
        fetch("/api/admin/orders", { headers }),
        fetch("/api/admin/customers", { headers }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (customersRes.ok) {
        const customers = await customersRes.json();
        setCustomerCount(customers.length);
      }
      setLoading(false);
    });
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const itemCounts = orders
    .flatMap((o) => o.order_items)
    .reduce<Record<string, number>>((acc, item) => {
      const name = item.products?.name ?? "unknown";
      acc[name] = (acc[name] ?? 0) + item.quantity;
      return acc;
    }, {});

  const popularItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div>
        <h1 className="font-playfair text-5xl text-ink mb-12">overview.</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-ink/10 p-6 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-playfair text-5xl text-ink mb-12">overview.</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <StatCard label="orders today"    value={todayOrders.length} />
        <StatCard label="pending orders"  value={pendingOrders.length} highlight />
        <StatCard label="revenue today"   value={`$${todayRevenue.toFixed(2)}`} />
        <StatCard label="total customers" value={customerCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-playfair text-2xl text-ink">recent orders.</h2>
            <Link href="/admin/orders" className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors">
              view all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="font-inter text-sm text-ink/40">no orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border border-ink/10 px-5 py-4 gap-4">
                  <div>
                    <p className="font-inter text-sm text-ink">{order.order_number}</p>
                    <p className="font-inter text-xs text-ink/40">{order.profiles?.full_name ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-inter text-sm text-ink">${Number(order.total_amount).toFixed(2)}</p>
                    <span className={`font-inter text-xs tracking-widest uppercase px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <Link href="/admin/orders" className="font-inter text-xs text-burgundy hover:text-ink transition-colors">
                      view
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-playfair text-2xl text-ink mb-6">popular items.</h2>
          {popularItems.length === 0 ? (
            <p className="font-inter text-sm text-ink/40">no orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {popularItems.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <div className="flex items-center gap-4">
                    <span className="font-playfair text-2xl text-ink/20">{i + 1}</span>
                    <p className="font-inter text-sm text-ink">{name}</p>
                  </div>
                  <p className="font-inter text-xs text-ink/40">{count} ordered</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
