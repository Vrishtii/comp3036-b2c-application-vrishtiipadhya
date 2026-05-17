"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";

export default function OrderConfirmation() {
  const { order } = useOrder();
  const router = useRouter();

  useEffect(() => {
    if (!order) router.replace("/");
  }, [order, router]);

  if (!order) return null;

  return (
    <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen">
      {/* Header */}
      <div className="max-w-xl mb-16">
        <p className="font-inter text-xs tracking-widest uppercase text-burgundy mb-4">
          order confirmed
        </p>
        <h1 className="font-playfair text-6xl md:text-7xl text-ink mb-4">
          order placed!
        </h1>
        <p className="font-inter text-base text-ink/55 leading-relaxed">
          thanks {order.customerName.split(" ")[0].toLowerCase()}, your order is in. we&apos;ll have it ready for pickup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
        {/* Left: order details */}
        <div>
          {/* Order number */}
          <div className="border border-ink/10 p-6 mb-10 flex items-center justify-between">
            <span className="font-inter text-xs tracking-widest uppercase text-ink/40">
              order number
            </span>
            <span className="font-playfair text-2xl text-burgundy">
              {order.orderNumber}
            </span>
          </div>

          {/* Items */}
          <h2 className="font-playfair text-2xl text-ink mb-6">your order.</h2>
          <div className="border-t border-ink/10">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between gap-6 py-6 border-b border-ink/10"
              >
                <div>
                  <p className="font-playfair text-lg text-ink mb-1">{item.name}</p>
                  <p className="font-inter text-xs text-ink/40 mb-1">qty: {item.quantity}</p>
                  {item.customNotes && (
                    <p className="font-inter text-xs text-ink/40 italic">
                      note: {item.customNotes}
                    </p>
                  )}
                </div>
                <p className="font-inter text-sm text-ink shrink-0">
                  ${(item.priceValue * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-inter text-sm py-6 border-b border-ink/10">
            <span className="text-ink/50 tracking-widest uppercase">subtotal</span>
            <span className="text-ink">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-inter text-sm py-6 border-b border-ink/10">
            <span className="text-ink/50 tracking-widest uppercase">pickup</span>
            <span className="text-ink/50">free</span>
          </div>
          <div className="flex justify-between items-baseline pt-6">
            <span className="font-inter text-xs tracking-widest uppercase text-ink/50">total</span>
            <span className="font-playfair text-3xl text-burgundy">
              ${order.subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: pickup + customer details */}
        <div className="flex flex-col gap-6">
          <div className="border border-ink/10 p-6">
            <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">
              pickup details
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between font-inter text-sm">
                <span className="text-ink/50">date</span>
                <span className="text-ink">{order.pickupDate}</span>
              </div>
              <div className="flex justify-between font-inter text-sm">
                <span className="text-ink/50">time</span>
                <span className="text-ink">{order.pickupTime}</span>
              </div>
            </div>
          </div>

          <div className="border border-ink/10 p-6">
            <p className="font-inter text-xs tracking-widest uppercase text-ink/40 mb-4">
              your details
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between font-inter text-sm">
                <span className="text-ink/50">name</span>
                <span className="text-ink">{order.customerName}</span>
              </div>
              <div className="flex justify-between font-inter text-sm">
                <span className="text-ink/50">email</span>
                <span className="text-ink">{order.customerEmail}</span>
              </div>
              <div className="flex justify-between font-inter text-sm">
                <span className="text-ink/50">phone</span>
                <span className="text-ink">{order.customerPhone}</span>
              </div>
              {order.additionalNotes && (
                <div className="flex justify-between font-inter text-sm">
                  <span className="text-ink/50">notes</span>
                  <span className="text-ink text-right max-w-[60%]">{order.additionalNotes}</span>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/"
            className="w-full block text-center bg-burgundy text-cream py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
          >
            back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
