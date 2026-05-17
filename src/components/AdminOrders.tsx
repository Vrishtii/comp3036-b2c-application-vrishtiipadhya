"use client";

import { useState } from "react";
import { useOrder, type Order, type OrderStatus } from "@/context/OrderContext";

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

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrder();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchDate = !dateFilter || o.pickupDate === dateFilter;
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  return (
    <div>
      <h1 className="font-playfair text-5xl text-ink mb-10">orders.</h1>

      {/* Filters */}
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

      {/* Orders table */}
      {filtered.length === 0 ? (
        <p className="font-inter text-sm text-ink/40 py-20 text-center">no orders found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.orderNumber}
              order={order}
              isExpanded={expanded === order.orderNumber}
              onToggle={() => setExpanded(expanded === order.orderNumber ? null : order.orderNumber)}
              onStatusChange={(status) => updateOrderStatus(order.orderNumber, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: OrderStatus) => void;
}) {
  return (
    <div className="border border-ink/10">
      {/* Row */}
      <div
        className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 cursor-pointer hover:bg-ink/5 transition-colors"
        onClick={onToggle}
      >
        <div>
          <p className="font-inter text-sm text-burgundy">{order.orderNumber}</p>
          <p className="font-inter text-xs text-ink/40">{order.customerName}</p>
        </div>
        <p className="font-inter text-xs text-ink/50">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""} · pickup {order.pickupDate}
        </p>
        <p className="font-inter text-sm text-ink">${order.subtotal.toFixed(2)}</p>
        <p className="font-inter text-xs text-ink/40">{order.pickupTime}</p>
        {/* Status dropdown — stop propagation so it doesn't toggle the row */}
        <select
          value={order.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { e.stopPropagation(); onStatusChange(e.target.value as OrderStatus); }}
          className={`bg-transparent border-0 font-inter text-xs tracking-widest uppercase focus:outline-none cursor-pointer px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <span className="font-inter text-xs text-ink/30">{isExpanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-ink/10 px-5 py-6 bg-ink/[0.02]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">items</p>
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div key={item.productId}>
                    <div className="flex justify-between font-inter text-sm">
                      <span className="text-ink">{item.name} <span className="text-ink/40">× {item.quantity}</span></span>
                      <span className="text-ink">${(item.priceValue * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.customNotes && (
                      <p className="font-inter text-xs text-ink/40 italic mt-1">note: {item.customNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-3">customer details</p>
              <div className="flex flex-col gap-2 font-inter text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/50">email</span>
                  <span className="text-ink">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/50">phone</span>
                  <span className="text-ink">{order.customerPhone}</span>
                </div>
                {order.additionalNotes && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50 shrink-0">notes</span>
                    <span className="text-ink text-right">{order.additionalNotes}</span>
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
