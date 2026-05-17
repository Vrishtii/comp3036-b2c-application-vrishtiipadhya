import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const products = [
  {
    name: "Dark Chocolate Brownie",
    price: "$4.50",
    description: "Rich, fudgy, and intensely chocolatey with a crinkle top.",
  },
  {
    name: "Brown Butter Cookie",
    price: "$3.00",
    description: "Crisp edges, chewy centre, finished with flaky sea salt.",
  },
  {
    name: "Sourdough Loaf",
    price: "$12.00",
    description: "Slow-fermented overnight, golden crust, open crumb.",
  },
];

const categories = ["brownies", "cookies", "loaves"];

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
          <a
            href="#products"
            className="inline-block bg-burgundy text-cream px-10 py-4 font-inter text-xs tracking-widest uppercase hover:bg-ink transition-colors"
          >
            order now
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-8 md:px-20 border-t border-ink/10">
        <div className="grid grid-cols-3 divide-x divide-ink/10">
          {categories.map((cat) => (
            <div key={cat} className="flex flex-col items-center py-10 gap-4">
              <p className="font-playfair text-2xl md:text-3xl text-ink">{cat}</p>
              <span className="block w-8 h-px bg-burgundy" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-20 px-8 md:px-20">
        <div className="flex items-end justify-between mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl text-ink">this week&apos;s picks.</h2>
          <a href="#" className="font-inter text-xs tracking-widest uppercase text-burgundy hover:text-ink transition-colors hidden md:block">
            view all →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map((product) => (
            <div key={product.name} className="flex flex-col">
              <div className="aspect-square bg-[#E8E0D0] mb-6" />
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-playfair text-xl text-ink">{product.name}</h3>
                <span className="font-inter text-sm text-burgundy font-medium ml-4 shrink-0">
                  {product.price}
                </span>
              </div>
              <p className="font-inter text-sm text-ink/55 mb-8 leading-relaxed flex-1">
                {product.description}
              </p>
              <button className="border border-burgundy text-burgundy py-3 font-inter text-xs tracking-widest uppercase hover:bg-burgundy hover:text-cream transition-colors">
                add to cart
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
