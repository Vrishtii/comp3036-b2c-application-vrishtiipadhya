import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getSupabase()
    .from("products")
    .select("name, description")
    .eq("id", id)
    .single();

  if (!data) return { title: "not found — crave." };
  return {
    title: `${data.name.toLowerCase()} — crave.`,
    description: data.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("category_id", product.category_id)
    .neq("id", id)
    .eq("is_available", true)
    .limit(3);

  return (
    <>
      <Navbar />
      <ProductDetail product={product} related={related ?? []} />
      <Footer />
    </>
  );
}
