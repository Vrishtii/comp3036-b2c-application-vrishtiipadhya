"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem } from "@/context/CartContext";

export interface Order {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  additionalNotes: string;
  placedAt: string;
}

interface OrderContextValue {
  order: Order | null;
  saveOrder: (order: Order) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

const STORAGE_KEY = "crave_order";

export function OrderProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setOrder(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function saveOrder(newOrder: Order) {
    setOrder(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  }

  function clearOrder() {
    setOrder(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <OrderContext.Provider value={{ order, saveOrder, clearOrder }}>
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
