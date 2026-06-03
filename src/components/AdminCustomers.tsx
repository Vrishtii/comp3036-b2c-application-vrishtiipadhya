"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  pickup_date: string;
  total_amount: number;
  order_items: { id: string }[];
}

interface CustomerDetail extends Customer {
  orders: CustomerOrder[];
}

const supabase = createClient();

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, CustomerDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const res = await fetch("/api/admin/customers", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) setCustomers(await res.json());
      else setError("failed to load customers");
      setLoading(false);
    });
  }, []);

  async function toggleExpand(customerId: string) {
    if (expanded === customerId) { setExpanded(null); return; }

    setExpanded(customerId);

    if (detail[customerId]) return;

    setLoadingDetail(customerId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/admin/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setDetail((prev) => ({ ...prev, [customerId]: data }));
    }
    setLoadingDetail(null);
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  function joinDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-AU", {
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

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-ink/10 px-5 py-4 animate-pulse h-14" />
          ))}
        </div>
      ) : error ? (
        <p className="font-inter text-sm text-burgundy py-20 text-center">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="font-inter text-sm text-ink/40 py-20 text-center">
          {customers.length === 0 ? "no registered customers yet." : "no customers match that search."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((customer) => {
            const isOpen = expanded === customer.id;
            const customerDetail = detail[customer.id];

            return (
              <div key={customer.id} className="border border-ink/10">
                <div
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 cursor-pointer hover:bg-ink/5 transition-colors"
                  onClick={() => toggleExpand(customer.id)}
                >
                  <div>
                    <p className="font-inter text-sm text-ink">{customer.full_name}</p>
                    <p className="font-inter text-xs text-ink/40">{customer.email}</p>
                  </div>
                  <p className="font-inter text-xs text-ink/40">joined {joinDate(customer.created_at)}</p>
                  <p className="font-inter text-xs text-ink/50">{customer.order_count} order{customer.order_count !== 1 ? "s" : ""}</p>
                  <p className="font-inter text-sm text-ink">${Number(customer.total_spent).toFixed(2)}</p>
                  <span className="font-inter text-xs text-ink/30">{isOpen ? "▲" : "▼"}</span>
                </div>

                {isOpen && (
                  <div className="border-t border-ink/10 px-5 py-6 bg-ink/[0.02]">
                    <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">order history</p>
                    {loadingDetail === customer.id ? (
                      <p className="font-inter text-sm text-ink/40">loading...</p>
                    ) : !customerDetail || customerDetail.orders.length === 0 ? (
                      <p className="font-inter text-sm text-ink/40">no orders placed yet.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {[...customerDetail.orders]
                          .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
                          .map((order) => (
                            <div key={order.id} className="flex items-center justify-between border-b border-ink/10 pb-3">
                              <div>
                                <p className="font-inter text-sm text-burgundy">{order.order_number}</p>
                                <p className="font-inter text-xs text-ink/40">
                                  {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} · pickup {order.pickup_date}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="font-inter text-sm text-ink">${Number(order.total_amount).toFixed(2)}</p>
                                <span className="font-inter text-xs tracking-widest uppercase text-ink/40">{order.status}</span>
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
