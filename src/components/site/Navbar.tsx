import { Link } from "../../lib/simple-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#products", label: "Our Products" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact Us" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        scrolled
          ? "bg-[#0a1520]/95 backdrop-blur-md shadow-lg py-2 border-b border-white/10"
          : "bg-[#0a1520] py-4 border-b border-white/5"
      }`}
    >
      <nav className="container-x flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 shadow-sm p-1">
            {/* SVG Logo matching user uploaded logo */}
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full"
            >
              <path
                d="M50 10 C65 20, 85 20, 85 45 C85 70, 50 90, 50 90 C50 90, 15 70, 15 45 C15 20, 35 20, 50 10 Z"
                fill="#e8b72a"
              />
              <path
                d="M50 22 C53 25, 60 30, 60 45 C60 62, 50 78, 50 78 C50 78, 40 62, 40 45 C40 30, 47 25, 50 22 Z"
                fill="#ffffff"
              />
              <path
                d="M50 28 Q48 40 42 55 M50 35 Q52 48 58 60 M50 22 L50 78"
                stroke="#e8b72a"
                strokeWidth="3.5"
                fill="none"
              />
            </svg>

          </div>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-xl font-extrabold text-white tracking-wide transition-colors group-hover:text-gold">
              Agrozaar
            </span>
            <span className="text-[0.65rem] font-bold tracking-[0.25em] text-gold mt-0.5">
              FOODS LLP
            </span>
          </span>
        </a>



        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-white/90 transition-colors hover:text-gold cursor-pointer"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className="text-sm font-semibold text-white/80 transition-colors hover:text-gold"
          >
            ERP Login
          </Link>
          <a
            href="#contact"
            className="rounded-md bg-gold hover:bg-gold/90 text-[#0a1520] px-5 py-2.5 text-sm font-bold shadow-md transition-all duration-300 hover:shadow-gold/20 hover:-translate-y-0.5 btn-shine"
          >
            Connect With Us
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#0a1520] md:hidden transition-all duration-300">
          <div className="container-x flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/5 hover:text-gold transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/5 hover:text-gold transition-colors"
            >
              ERP Login
            </Link>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-gold py-2.5 text-center text-sm font-bold text-[#0a1520] shadow-md hover:bg-gold/90"
            >
              Connect With Us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

