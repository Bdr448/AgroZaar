import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import turmeric from "@/assets/product-turmeric.jpg";
import chilli from "@/assets/product-chilli.jpg";
import coriander from "@/assets/product-coriander.jpg";
import cumin from "@/assets/product-cumin.jpg";
import garam from "@/assets/product-garam-masala.jpg";

const defaultImages = [turmeric, chilli, coriander, cumin, garam];

const products = [
  {
    img: turmeric,
    name: "Premium Turmeric Powder",
    desc: "Vibrant golden-yellow color, high curcumin content, and rich earthy aroma.",
    href: "#contact",
  },
  {
    img: chilli,
    name: "Vibrant Chilli Powder",
    desc: "Milled from carefully selected premium red chillies for optimal color and heat.",
    href: "#contact",
  },
  {
    img: coriander,
    name: "Aromatic Coriander Powder",
    desc: "Freshly milled from sorted coriander seeds to preserve citrusy notes.",
    href: "#contact",
  },
  {
    img: cumin,
    name: "Pure Cumin Powder",
    desc: "Warm, nutty ground cumin — clean, aromatic, and export-grade purity.",
    href: "#contact",
  },
  {
    img: garam,
    name: "Signature Garam Masala",
    desc: "Authentic whole-spice blend crafted to deliver warm depth and complexity.",
    href: "#contact",
  },
];

interface ProductsProps {
  spices?: Array<{ name: string; desc: string; image_url?: string }>;
}

export function Products({ spices }: ProductsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const displaySpices = (spices && spices.length > 0)
    ? spices.map((s, idx) => ({
        name: s.name,
        desc: s.desc,
        img: s.image_url || defaultImages[idx % defaultImages.length],
        href: "#contact",
      }))
    : products;

  const allItems = [
    ...displaySpices,
    {
      name: "Custom Spice Blends",
      desc: "Private-label custom formulations and customized spice grinding specifications.",
      img: manufacturingImg(),
      href: "#contact",
    },
  ];

  // Helper helper to return a manufacturing image
  function manufacturingImg() {
    return defaultImages[0]; // fallback to turmeric/spice
  }

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 340;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="products" className="py-16 md:py-24 bg-[#0a1520] text-white">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Our Products
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
            Premium Spices, Packed with Purity
          </h2>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            Explore our complete range of certified ground spices and custom formulations, available in bulk and export packaging.
          </p>
        </div>

        <div className="relative mt-8">
          {/* Slider controls */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full text-white transition-all border border-white/20 hover:scale-105"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full text-white transition-all border border-white/20 hover:scale-105"
            aria-label="Next products"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Cards container */}
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto scrollbar-none py-6 px-10 scroll-smooth"
          >
            {allItems.map((item, idx) => (
              <div
                key={idx}
                className="flex-none w-[280px] md:w-[320px] p-1 animate-on-scroll"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg product-card h-80 relative group border border-white/10">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] mb-1">
                      Aviraaj Spices
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-white/70 text-xs line-clamp-2 mb-4 leading-normal">
                      {item.desc}
                    </p>
                    <a
                      href={item.href}
                      className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0a1520] font-bold py-2 px-5 rounded-md text-xs transition-colors w-fit btn-shine text-center"
                    >
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="#contact"
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0a1520] font-bold py-3 px-8 rounded-md text-sm md:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/30 btn-shine"
          >
            Request Wholesale Quotation
          </a>
        </div>
      </div>
    </section>
  );
}

