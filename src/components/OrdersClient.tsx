"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOrder, type Order, type OrderStatus } from "@/context/OrderContext";

type SortOrder = "newest" | "oldest";
type StatusFilter = "all" | OrderStatus;

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-ink/10 text-ink/50",
  confirmed: "bg-yellow-100 text-yellow-700",
  ready:     "bg-green-100 text-green-700",
  completed: "bg-burgundy/10 text-burgundy",
};

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "all", value: "all" },
  { label: "pending", value: "pending" },
  { label: "confirmed", value: "confirmed" },
  { label: "ready", value: "ready" },
  { label: "completed", value: "completed" },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-3 py-1 font-inter text-xs tracking-widest uppercase rounded-full ${STATUS_STYLES[status]}`}>
      {status === "ready" ? "ready for pickup" : status}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const date = new Date(order.placedAt);
  const formatted = date.toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  });
  const time = date.toLocaleTimeString("en-AU", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="border border-ink/10 p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-playfair text-2xl text-burgundy mb-1">{order.orderNumber}</p>
          <p className="font-inter text-xs text-ink/40">placed {formatted} at {time}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="border-t border-ink/10 pt-6 mb-6">
        <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">items</p>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between font-inter text-sm">
              <span className="text-ink">{item.name} <span className="text-ink/40">× {item.quantity}</span></span>
              <span className="text-ink">${(item.priceValue * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-ink/10 pt-6">
        <div className="flex flex-col gap-1">
          <p className="font-inter text-xs text-ink/40">
            pickup {order.pickupDate} at {order.pickupTime}
          </p>
          <p className="font-inter text-sm font-medium text-ink">
            total: <span className="text-burgundy font-playfair text-lg">${order.subtotal.toFixed(2)}</span>
          </p>
        </div>
        <Link
          href={`/orders/${order.orderNumber}`}
          className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors border border-burgundy px-6 py-3 hover:bg-burgundy hover:text-cream"
        >
          view details
        </Link>
      </div>
    </div>
  );
}

export default function OrdersClient() {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const { orders } = useOrder();
  const router = useRouter();

  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login?redirect=/orders");
    else if (isAdmin) router.replace("/dashboard");
  }, [isLoggedIn, isAdmin, router]);

  if (!isLoggedIn || isAdmin) return null;

  const userOrders = orders.filter((o) => o.userId === user!.id);

  const filtered = userOrders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .sort((a, b) => {
      const diff = new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-playfair text-6xl md:text-7xl text-ink mb-3">your orders.</h1>
        <p className="font-inter text-sm text-ink/50">
          {user!.name.split(" ")[0].toLowerCase()}&apos;s order history
        </p>
      </div>

      {userOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <p className="font-playfair text-4xl text-ink mb-4">no orders yet.</p>
          <p className="font-inter text-sm text-ink/50 mb-8">
            when you place an order it&apos;ll show up here.
          </p>
          <Link
            href="/menu"
            className="bg-burgundy text-cream px-8 py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
          >
            browse menu →
          </Link>
        </div>
      ) : (
        <>
          {/* Sort + filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-cream border border-ink/20 px-4 py-3 font-inter text-sm text-ink focus:outline-none focus:border-burgundy transition-colors"
            >
              <option value="newest">newest first</option>
              <option value="oldest">oldest first</option>
            </select>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-5 py-3 font-inter text-xs tracking-widest uppercase transition-colors ${
                    statusFilter === f.value
                      ? "bg-burgundy text-cream"
                      : "border border-ink/20 text-ink hover:border-burgundy hover:text-burgundy"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders list */}
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filtered.map((order) => (
                <OrderCard key={order.orderNumber} order={order} />
              ))}
            </div>
          ) : (
            <p className="font-inter text-sm text-ink/40 py-20 text-center">
              no orders match that filter.
            </p>
          )}
        </>
      )}
    </div>
  );
}
