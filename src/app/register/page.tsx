import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "register — crave.",
  description: "create an account.",
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-8 py-32">
        <RegisterForm />
      </main>
    </>
  );
}
