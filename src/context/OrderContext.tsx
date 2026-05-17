"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem } from "@/context/CartContext";

export type OrderStatus = "pending" | "confirmed" | "ready" | "completed";

export interface Order {
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  additionalNotes: string;
  placedAt: string;
  status: OrderStatus;
}

interface OrderContextValue {
  orders: Order[];
  order: Order | null;
  saveOrder: (order: Order) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

const STORAGE_KEY = "crave_orders";

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setOrders(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveOrder(newOrder: Order) {
    setOrders((prev) => {
      const updated = [...prev, newOrder];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function clearOrder() {
    setOrders([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        order: orders.length > 0 ? orders[orders.length - 1] : null,
        saveOrder,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within an OrderProvider");
  return ctx;
}

export function generateOrderNumber(): string {
  return `CRAVE-${Math.floor(1000 + Math.random() * 9000)}`;
}
