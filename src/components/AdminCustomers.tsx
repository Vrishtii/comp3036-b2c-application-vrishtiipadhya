"use client";

import { useEffect, useState } from "react";
import { useOrder } from "@/context/OrderContext";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export default function AdminCustomers() {
  const { orders } = useOrder();
  const [customers, setCustomers] = useState<StoredUser[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem("crave_users") || "[]");
      setCustomers(users.filter((u) => u.role === "customer"));
    } catch { setCustomers([]); }
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  function joinDate(id: string) {
    const ts = parseInt(id.replace("user-", ""), 10);
    if (isNaN(ts)) return "—";
    return new Date(ts).toLocaleDateString("en-AU", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <div>
      <h1 className="font-playfair text-5xl text-ink mb-10">customers.</h1>

      <input
        type="text"
        placeholder="search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md bg-transparent border border-ink/20 px-4 py-3 font-inter text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-burgundy transition-colors mb-8"
      />

      {filtered.length === 0 ? (
        <p className="font-inter text-sm text-ink/40 py-20 text-center">
          {customers.length === 0 ? "no registered customers yet." : "no customers match that search."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((customer) => {
            const customerOrders = orders.filter((o) => o.userId === customer.id);
            const totalSpent = customerOrders.reduce((sum, o) => sum + o.subtotal, 0);
            const isOpen = expanded === customer.id;

            return (
              <div key={customer.id} className="border border-ink/10">
                {/* Row */}
                <div
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 cursor-pointer hover:bg-ink/5 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : customer.id)}
                >
                  <div>
                    <p className="font-inter text-sm text-ink">{customer.name}</p>
                    <p className="font-inter text-xs text-ink/40">{customer.email}</p>
                  </div>
                  <p className="font-inter text-xs text-ink/40">joined {joinDate(customer.id)}</p>
                  <p className="font-inter text-xs text-ink/50">{customerOrders.length} order{customerOrders.length !== 1 ? "s" : ""}</p>
                  <p className="font-inter text-sm text-ink">${totalSpent.toFixed(2)}</p>
                  <span className="font-inter text-xs text-ink/30">{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* Expanded order history */}
                {isOpen && (
                  <div className="border-t border-ink/10 px-5 py-6 bg-ink/[0.02]">
                    <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">order history</p>
                    {customerOrders.length === 0 ? (
                      <p className="font-inter text-sm text-ink/40">no orders placed yet.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {[...customerOrders]
                          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
                          .map((order) => (
                            <div key={order.orderNumber} className="flex items-center justify-between border-b border-ink/10 pb-3">
                              <div>
                                <p className="font-inter text-sm text-burgundy">{order.orderNumber}</p>
                                <p className="font-inter text-xs text-ink/40">
                                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · pickup {order.pickupDate}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="font-inter text-sm text-ink">${order.subtotal.toFixed(2)}</p>
                                <span className="font-inter text-xs tracking-widest uppercase text-ink/40">
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
