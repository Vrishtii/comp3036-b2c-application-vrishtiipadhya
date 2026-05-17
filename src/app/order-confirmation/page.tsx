import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderConfirmation from "@/components/OrderConfirmation";

export const metadata: Metadata = {
  title: "order confirmed — crave.",
  description: "your order has been placed.",
};

export default function OrderConfirmationPage() {
  return (
    <>
      <Navbar />
      <OrderConfirmation />
      <Footer />
    </>
  );
}
