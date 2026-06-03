import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeFeatured from "@/components/HomeFeatured";

const categories = [
  { label: "brownies", value: "Brownies" },
  { label: "cookies",  value: "Cookies" },
  { label: "loaves",   value: "Loaves" },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-20 pt-24">
        <div className="max-w-4xl">
          <p className="font-inter text-xs tracking-widest uppercase text-burgundy mb-8">
            home bakery · small batch · made to order
          </p>
          <h1 className="font-playfair text-6xl md:text-8xl lg:text-9xl text-ink leading-none mb-8">
            baked for<br />the craving.
          </h1>
          <p className="font-inter text-lg text-ink/60 max-w-md mb-12 leading-relaxed">
            Small-batch brownies, cookies, and loaves — made fresh to order and delivered straight to your door.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-burgundy text-cream px-10 py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
          >
            order now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-8 md:px-20 border-t border-ink/10">
        <div className="grid grid-cols-3 divide-x divide-ink/10">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={`/menu?category=${cat.value}`}
              className="flex flex-col items-center py-10 gap-4 hover:opacity-70 transition-opacity"
            >
              <p className="font-playfair text-2xl md:text-3xl text-ink">{cat.label}</p>
              <span className="block w-8 h-px bg-burgundy" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-20 px-8 md:px-20">
        <div className="flex items-end justify-between mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl text-ink">this week&apos;s picks.</h2>
          <Link
            href="/menu"
            className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors hidden md:block"
          >
            view all →
          </Link>
        </div>
        <HomeFeatured />
      </section>

      <Footer />
    </>
  );
}
