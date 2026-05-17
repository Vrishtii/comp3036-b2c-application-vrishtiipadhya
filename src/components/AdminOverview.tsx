"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useOrder, type OrderStatus } from "@/context/OrderContext";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-ink/10 text-ink/50",
  confirmed: "bg-yellow-100 text-yellow-700",
  ready:     "bg-green-100 text-green-700",
  completed: "bg-burgundy/10 text-burgundy",
};

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`border p-6 ${highlight ? "border-burgundy/30 bg-burgundy/5" : "border-ink/10"}`}>
      <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">{label}</p>
      <p className={`font-playfair text-4xl ${highlight ? "text-burgundy" : "text-ink"}`}>{value}</p>
    </div>
  );
}

export default function AdminOverview() {
  const { orders } = useOrder();
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("crave_users") || "[]");
      setCustomerCount(users.length);
    } catch { setCustomerCount(0); }
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.placedAt).toDateString() === today);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 5);

  const itemCounts = orders
    .flatMap((o) => o.items)
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.name] = (acc[item.name] ?? 0) + item.quantity;
      return acc;
    }, {});

  const popularItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-playfair text-5xl text-ink mb-12">overview.</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <StatCard label="orders today"    value={todayOrders.length} />
        <StatCard label="pending orders"  value={pendingOrders.length} highlight />
        <StatCard label="revenue today"   value={`$${todayRevenue.toFixed(2)}`} />
        <StatCard label="total customers" value={customerCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Recent orders */}
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
                <div key={order.orderNumber} className="flex items-center justify-between border border-ink/10 px-5 py-4 gap-4">
                  <div>
                    <p className="font-inter text-sm text-ink">{order.orderNumber}</p>
                    <p className="font-inter text-xs text-ink/40">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-inter text-sm text-ink">${order.subtotal.toFixed(2)}</p>
                    <span className={`font-inter text-xs tracking-widest uppercase px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <Link href={`/admin/orders`} className="font-inter text-xs text-burgundy hover:text-ink transition-colors">
                      view
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular items */}
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
