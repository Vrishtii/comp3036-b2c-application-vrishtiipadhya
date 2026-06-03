"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "overview",        href: "/admin" },
  { label: "orders",          href: "/admin/orders" },
  { label: "menu management", href: "/admin/menu" },
  { label: "customers",       href: "/admin/customers" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin, authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) router.replace("/login");
    else if (!isAdmin) router.replace("/menu");
  }, [authLoading, isLoggedIn, isAdmin, router]);

  if (authLoading || !isLoggedIn || !isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-ink/10 px-8 py-10 sticky top-0 h-screen">
        <Link href="/admin" className="font-playfair text-xl text-burgundy mb-12 block">
          crave. admin
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`font-inter text-xs tracking-widest uppercase py-3 px-4 transition-colors ${
                  active
                    ? "text-burgundy bg-burgundy/5"
                    : "text-ink/50 hover:text-burgundy"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => void logout()}
          className="font-inter text-xs tracking-widest uppercase text-ink/30 hover:text-burgundy transition-colors text-left py-3 px-4"
        >
          logout
        </button>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-ink/10 bg-cream/95 backdrop-blur-sm">
        {NAV.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 py-4 font-inter text-[10px] tracking-widest uppercase text-center transition-colors ${
                active ? "text-burgundy" : "text-ink/40"
              }`}
            >
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 px-8 md:px-12 py-10 md:py-16 pb-24 md:pb-16">
        {children}
      </main>
    </div>
  );
}
