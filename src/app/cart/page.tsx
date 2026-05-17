import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartClient from "@/components/CartClient";

export const metadata: Metadata = {
  title: "cart — crave.",
  description: "your order.",
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen">
        <h1 className="font-playfair text-6xl md:text-7xl text-ink mb-16">
          your order.
        </h1>
        <CartClient />
      </main>
      <Footer />
    </>
  );
}
