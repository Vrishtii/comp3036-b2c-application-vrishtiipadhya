"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  categories: { name: string } | null;
}

export default function HomeFeatured() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/products?limit=3")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setProducts(data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="aspect-square bg-ink/5 mb-6" />
            <div className="h-5 bg-ink/5 w-3/4 mb-2" />
            <div className="h-4 bg-ink/5 w-full mb-1" />
            <div className="h-4 bg-ink/5 w-2/3 mb-8" />
            <div className="h-10 bg-ink/5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {products.map((product, index) => (
        <div key={product.id} className="flex flex-col">
          <Link href={`/menu/${product.id}`} className="group block mb-6">
            <div className="aspect-square bg-[#E8E0D0] relative group-hover:opacity-85 transition-opacity">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority={index === 0}
                />
              )}
            </div>
          </Link>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-playfair text-xl text-ink">{product.name}</h3>
            <span className="font-inter text-sm text-burgundy font-medium ml-4 shrink-0">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          <p className="font-inter text-sm text-ink/55 mb-8 leading-relaxed flex-1">
            {product.description}
          </p>
          <button
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: `$${Number(product.price).toFixed(2)}`,
                priceValue: Number(product.price),
                quantity: 1,
                customNotes: "",
              })
            }
            className="border border-burgundy text-burgundy py-3 font-inter text-xs tracking-widest uppercase hover:bg-burgundy hover:text-cream transition-colors"
          >
            add to cart
          </button>
        </div>
      ))}
    </div>
  );
}
