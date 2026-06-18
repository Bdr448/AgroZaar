import { Building2, Truck, Store, Ship, Boxes } from "lucide-react";

const cats = [
  {
    icon: Building2,
    title: "B2B Supply",
    desc: "Reliable bulk supply for food processors and manufacturers.",
  },
  {
    icon: Truck,
    title: "Distributors",
    desc: "Margin-friendly partnerships with regional distributors.",
  },
  { icon: Store, title: "Retailers", desc: "Retail-ready packs under the Aviraaj brand." },
  { icon: Ship, title: "Export", desc: "Documentation and packaging for international buyers." },
  {
    icon: Boxes,
    title: "Bulk Orders",
    desc: "Custom volumes with consistent, repeatable quality.",
  },
];

export function BusinessCategories() {
  return (
    <section className="section-pad bg-secondary/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Who We Serve
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">
            Business categories we supply
          </h2>
        </div>

        <div className="relative mt-8 md:mt-14 overflow-hidden w-full">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] py-4">
            {/* First Set */}
            <div className="flex shrink-0">
              {cats.map((c) => (
                <div
                  key={`cat1-${c.title}`}
                  className="group rounded-2xl border border-border bg-card p-5 md:p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-card w-[220px] md:w-[260px] shrink-0 mr-6"
                >
                  <span className="mx-auto flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <c.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </span>
                  <h3 className="mt-4 md:mt-5 font-heading text-sm md:text-base font-bold text-spice-brown">{c.title}</h3>
                  <p className="mt-1.5 md:mt-2 text-[10px] md:text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
            {/* Second Set */}
            <div className="flex shrink-0" aria-hidden="true">
              {cats.map((c) => (
                <div
                  key={`cat2-${c.title}`}
                  className="group rounded-2xl border border-border bg-card p-5 md:p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-card w-[220px] md:w-[260px] shrink-0 mr-6"
                >
                  <span className="mx-auto flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <c.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </span>
                  <h3 className="mt-4 md:mt-5 font-heading text-sm md:text-base font-bold text-spice-brown">{c.title}</h3>
                  <p className="mt-1.5 md:mt-2 text-[10px] md:text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
