import type { Metadata } from "next";
import AdminOrders from "@/components/AdminOrders";

export const metadata: Metadata = { title: "orders — crave. admin" };

export default function AdminOrdersPage() {
  return <AdminOrders />;
}
