import type { Metadata } from "next";
import AdminProfileClient from "@/components/AdminProfileClient";

export const metadata: Metadata = { title: "profile — crave. admin" };

export default function AdminProfilePage() {
  return <AdminProfileClient />;
}
