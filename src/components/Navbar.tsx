export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-20 py-6 bg-cream/90 backdrop-blur-sm">
      <span className="font-playfair text-2xl text-burgundy">crave.</span>
      <div className="flex gap-8 font-inter text-sm tracking-widest uppercase text-ink">
        <a href="/menu" className="hover:text-burgundy transition-colors">Menu</a>
        <a href="#" className="hover:text-burgundy transition-colors">About</a>
        <a href="#products" className="hover:text-burgundy transition-colors">Order</a>
      </div>
    </nav>
  );
}
