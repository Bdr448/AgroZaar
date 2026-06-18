import { ArrowUpRight } from "lucide-react";
import turmeric from "@/assets/product-turmeric.jpg";
import chilli from "@/assets/product-chilli.jpg";
import coriander from "@/assets/product-coriander.jpg";
import cumin from "@/assets/product-cumin.jpg";
import garam from "@/assets/product-garam-masala.jpg";

const defaultImages = [turmeric, chilli, coriander, cumin, garam];

const products = [
  {
    img: turmeric,
    name: "Turmeric Powder",
    desc: "Vibrant golden color with high curcumin content and rich earthy aroma.",
  },
  {
    img: chilli,
    name: "Chilli Powder",
    desc: "Natural red color and balanced heat, milled from premium-grade chillies.",
  },
  {
    img: coriander,
    name: "Coriander Powder",
    desc: "Freshly ground from sorted seeds for a fragrant, citrusy flavor.",
  },
  {
    img: cumin,
    name: "Cumin Powder",
    desc: "Warm, nutty and aromatic — a kitchen and processing essential.",
  },
  {
    img: garam,
    name: "Garam Masala",
    desc: "Signature blend of whole spices for authentic depth and warmth.",
  },
];

interface ProductsProps {
  spices?: Array<{ name: string; desc: string; image_url?: string }>;
}

export function Products({ spices }: ProductsProps) {
  const displaySpices = (spices && spices.length > 0)
    ? spices.map((s, idx) => ({
        name: s.name,
        desc: s.desc,
        img: s.image_url || defaultImages[idx % defaultImages.length],
      }))
    : products;

  const items = [
    ...displaySpices.map((p) => ({ ...p, isCustom: false })),
    { name: "Custom Spice Blends", desc: "", img: "", isCustom: true },
  ];

  const renderItem = (item: { name: string; desc: string; img: string; isCustom: boolean }, keyPrefix: string) => {
    if (item.isCustom) {
      return (
        <article
          key={`${keyPrefix}-custom`}
          className="flex flex-col justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 sm:p-8 w-[280px] md:w-[320px] shrink-0 mr-6 text-left"
        >
          <h3 className="font-heading text-lg sm:text-xl font-bold text-spice-brown">Custom Spice Blends</h3>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Need a private-label or tailored formulation for your brand? We manufacture custom
            blends to your specification.
          </p>
          <a
            href="#contact"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Request a Quote <ArrowUpRight className="h-4 w-4" />
          </a>
        </article>
      );
    }

    return (
      <article
        key={`${keyPrefix}-${item.name}`}
        className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card w-[280px] md:w-[320px] shrink-0 mr-6 text-left"
      >
        <div className="relative overflow-hidden">
          <img
            src={item.img}
            alt={item.name}
            width={800}
            height={800}
            loading="lazy"
            className="h-28 sm:h-36 md:h-44 lg:h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-spice-brown shadow-soft">
            Aviraaj
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-spice-brown">{item.name}</h3>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
        </div>
      </article>
    );
  };

  return (
    <section id="products" className="py-8 md:py-16 bg-secondary/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Our Products
          </span>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold text-spice-brown text-balance">
            Premium spices, packed with purity
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete range of ground spices and blends, available in retail and bulk export
            packaging.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden w-full">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] py-4">
            {/* First Set */}
            <div className="flex shrink-0">
              {items.map((item) => renderItem(item, "set1"))}
            </div>
            {/* Second Set */}
            <div className="flex shrink-0" aria-hidden="true">
              {items.map((item) => renderItem(item, "set2"))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
