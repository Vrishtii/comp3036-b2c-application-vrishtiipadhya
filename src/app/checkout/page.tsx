import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "checkout — crave.",
  description: "complete your order.",
};

interface Props {
  searchParams: Promise<{ date?: string; time?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { date = "", time = "" } = await searchParams;

  return (
    <>
      <Navbar />
      <CheckoutClient
        pickupDate={date}
        pickupTime={decodeURIComponent(time)}
      />
      <Footer />
    </>
  );
}
