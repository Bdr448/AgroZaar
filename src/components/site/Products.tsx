import { ArrowUpRight } from "lucide-react";
import turmeric from "@/assets/product-turmeric.jpg";
import chilli from "@/assets/product-chilli.jpg";
import coriander from "@/assets/product-coriander.jpg";
import cumin from "@/assets/product-cumin.jpg";
import garam from "@/assets/product-garam-masala.jpg";

const products = [
  { img: turmeric, name: "Turmeric Powder", desc: "Vibrant golden color with high curcumin content and rich earthy aroma." },
  { img: chilli, name: "Chilli Powder", desc: "Natural red color and balanced heat, milled from premium-grade chillies." },
  { img: coriander, name: "Coriander Powder", desc: "Freshly ground from sorted seeds for a fragrant, citrusy flavor." },
  { img: cumin, name: "Cumin Powder", desc: "Warm, nutty and aromatic — a kitchen and processing essential." },
  { img: garam, name: "Garam Masala", desc: "Signature blend of whole spices for authentic depth and warmth." },
];

export function Products() {
  return (
    <section id="products" className="section-pad bg-secondary/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Our Products</span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">Premium spices, packed with purity</h2>
          <p className="mt-4 text-muted-foreground">A complete range of ground spices and blends, available in retail and bulk export packaging.</p>
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article key={p.name} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
              <div className="relative overflow-hidden">
                <img src={p.img} alt={p.name} width={800} height={800} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-spice-brown shadow-soft">Aviraaj</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading text-xl font-bold text-spice-brown">{p.name}</h3>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </article>
          ))}

          <article className="flex flex-col justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-8">
            <h3 className="font-heading text-xl font-bold text-spice-brown">Custom Spice Blends</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Need a private-label or tailored formulation for your brand? We manufacture custom blends to your specification.</p>
            <a href="#contact" className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
              Request a Quote <ArrowUpRight className="h-4 w-4" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
