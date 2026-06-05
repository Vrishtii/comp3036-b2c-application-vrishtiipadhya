import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "reset password — crave." };

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-8 py-32">
        <ResetPasswordForm />
      </main>
    </>
  );
}
