import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrdersClient from "@/components/OrdersClient";

export const metadata: Metadata = {
  title: "your orders — crave.",
  description: "view your order history.",
};

export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen">
        <OrdersClient />
      </main>
      <Footer />
    </>
  );
}
