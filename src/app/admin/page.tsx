import type { Metadata } from "next";
import AdminOverview from "@/components/AdminOverview";

export const metadata: Metadata = { title: "overview — crave. admin" };

export default function AdminPage() {
  return <AdminOverview />;
}
