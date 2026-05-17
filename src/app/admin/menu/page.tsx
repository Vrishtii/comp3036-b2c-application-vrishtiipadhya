import type { Metadata } from "next";
import AdminMenu from "@/components/AdminMenu";

export const metadata: Metadata = { title: "menu management — crave. admin" };

export default function AdminMenuPage() {
  return <AdminMenu />;
}
