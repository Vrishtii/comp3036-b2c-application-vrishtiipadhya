import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "forgot password — crave." };

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-8 py-32">
        <ForgotPasswordForm />
      </main>
    </>
  );
}
