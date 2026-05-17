"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-20 py-6 bg-cream/90 backdrop-blur-sm">
      <Link href="/" className="font-playfair text-2xl text-burgundy">
        crave.
      </Link>
      <div className="flex gap-8 font-inter text-sm tracking-widest uppercase text-ink">
        <Link href="/menu" className="hover:text-burgundy transition-colors">
          Menu
        </Link>
        <Link href="#" className="hover:text-burgundy transition-colors">
          About
        </Link>
        <Link href="/cart" className="relative hover:text-burgundy transition-colors">
          Cart
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-4 bg-burgundy text-cream font-inter text-[10px] w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
