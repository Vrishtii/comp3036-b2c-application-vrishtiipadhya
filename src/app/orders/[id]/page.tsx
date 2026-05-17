import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderDetail from "@/components/OrderDetail";

export const metadata: Metadata = {
  title: "order details — crave.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="px-8 md:px-20 pt-40 pb-20 min-h-screen">
        <OrderDetail orderNumber={id} />
      </main>
      <Footer />
    </>
  );
}
