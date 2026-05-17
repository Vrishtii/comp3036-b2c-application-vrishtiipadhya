import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return { title: "not found — crave." };
  return {
    title: `${product.name.toLowerCase()} — crave.`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <>
      <Navbar />
      <ProductDetail product={product} related={related} />
      <Footer />
    </>
  );
}
