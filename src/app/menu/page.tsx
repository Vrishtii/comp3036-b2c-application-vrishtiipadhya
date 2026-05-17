import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuClient from "@/components/MenuClient";

export const metadata: Metadata = {
  title: "menu — crave.",
  description: "everything baked fresh to order.",
};

export default function MenuPage() {
  return (
    <>
      <Navbar />

      <main className="px-8 md:px-20 pt-40 pb-20">
        {/* Page header */}
        <div className="mb-16 max-w-xl">
          <h1 className="font-playfair text-6xl md:text-7xl text-ink mb-4">our menu.</h1>
          <p className="font-inter text-base text-ink/55 leading-relaxed">
            everything baked fresh to order — placed by thursday for weekend delivery.
          </p>
        </div>

        <MenuClient />
      </main>

      <Footer />
    </>
  );
}
