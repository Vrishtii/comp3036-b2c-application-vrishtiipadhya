"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LogoutModal from "@/components/LogoutModal";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isLoggedIn, isAdmin, authLoading, logout } = useAuth();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!authLoading && isAdmin) router.replace("/admin");
  }, [authLoading, isAdmin, router]);

  if (isAdmin) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-20 py-6 bg-cream/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-playfair text-2xl text-burgundy">
            crave.
          </Link>
          {isLoggedIn && (
            <span className="hidden sm:inline font-inter text-xs text-ink/40 normal-case leading-none">
              hi, {user!.name.split(" ")[0].toLowerCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-8 font-inter text-sm tracking-widest uppercase text-ink">
          <Link href="/menu" className="hover:text-burgundy transition-colors">
            Menu
          </Link>
          <Link href="/cart" className="relative hover:text-burgundy transition-colors">
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-burgundy text-cream font-inter text-[10px] w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="hover:text-burgundy transition-colors">
                Profile
              </Link>
              <button
                onClick={() => setShowLogout(true)}
                className="hover:text-burgundy transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-burgundy transition-colors">
              Login
            </Link>
          )}
        </div>
      </nav>

      {showLogout && (
        <LogoutModal
          onConfirm={() => { setShowLogout(false); void logout(); }}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
