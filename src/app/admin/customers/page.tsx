import type { Metadata } from "next";
import AdminCustomers from "@/components/AdminCustomers";

export const metadata: Metadata = { title: "customers — crave. admin" };

export default function AdminCustomersPage() {
  return <AdminCustomers />;
}
