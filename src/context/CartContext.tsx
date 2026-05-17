"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  priceValue: number;
  quantity: number;
  customNotes: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (i) => i.productId !== action.payload.productId
        ),
      };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity < 1) {
        return {
          items: state.items.filter(
            (i) => i.productId !== action.payload.productId
          ),
        };
      }
      return {
        items: state.items.map((i) =>
          i.productId === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.priceValue * i.quantity,
    0
  );

  function addItem(item: CartItem) {
    dispatch({ type: "ADD_ITEM", payload: item });
  }
  function removeItem(productId: string) {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  }
  function updateQuantity(productId: string, quantity: number) {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  }
  function clearCart() {
    dispatch({ type: "CLEAR_CART" });
  }

  return (
    <CartContext.Provider
      value={{ items: state.items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
