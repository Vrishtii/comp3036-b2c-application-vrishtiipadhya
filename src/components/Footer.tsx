export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-8 md:px-20 py-16 mt-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-playfair text-2xl text-burgundy mb-1">crave.</p>
          <p className="font-inter text-sm text-ink/60">baked for the craving.</p>
        </div>
        <div className="flex gap-8 font-inter text-sm tracking-widest uppercase text-ink/60">
          <a href="#" className="hover:text-burgundy transition-colors">Menu</a>
          <a href="#" className="hover:text-burgundy transition-colors">About</a>
          <a href="#products" className="hover:text-burgundy transition-colors">Order</a>
          <a href="#" className="hover:text-burgundy transition-colors">Instagram</a>
        </div>
      </div>
      <p className="font-inter text-xs text-ink/40 mt-12">© 2025 crave. all rights reserved.</p>
    </footer>
  );
}
