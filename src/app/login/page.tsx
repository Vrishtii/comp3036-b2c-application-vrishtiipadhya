import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "login — crave.",
  description: "sign in to your account.",
};

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirect = "/menu" } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-8 py-32">
        <LoginForm redirectTo={redirect} />
      </main>
    </>
  );
}
