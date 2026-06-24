import { Wheat, Droplets, Cog, Blend, Package, Send } from "lucide-react";
import manufacturing from "@/assets/manufacturing.jpg";

const steps = [
  { icon: Wheat, title: "Mandi Sourcing", desc: "Direct farmer purchase & sorting" },
  { icon: Droplets, title: "Solar Drying", desc: "Cleaning, washing & drying" },
  { icon: Cog, title: "Cool Grinding", desc: "VOR low-temp pin-mill grinding" },
  { icon: Blend, title: "Blending & QA", desc: "Homogeneous mixing & lab checks" },
  { icon: Package, title: "Clean Packaging", desc: "Moisture-barrier double-wall packing" },
  { icon: Send, title: "Global Shipping", desc: "FOB Mundra Port & sea cargo logistics" },
];

export function ManufacturingProcess() {
  return (
    <section id="process" className="section-pad bg-secondary/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Manufacturing
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">
            From raw material to dispatch
          </h2>
          <p className="mt-4 text-muted-foreground">
            A controlled, hygienic process that protects color, aroma and purity at every step.
          </p>
        </div>

        <div className="mt-8 md:mt-12 overflow-hidden rounded-2xl md:rounded-3xl border border-border shadow-card">
          <img
            src={manufacturing}
            alt="Modern spice manufacturing facility"
            width={1280}
            height={854}
            loading="lazy"
            className="h-40 w-full object-cover md:h-80"
          />
        </div>

        {/* Desktop and Tablet Layout: Horizontal Timeline flow with arrow connectors */}
        <div className="mt-8 md:mt-10 hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex flex-col items-center bg-card border border-border rounded-2xl p-5 text-center shadow-soft transition-transform hover:-translate-y-1"
            >
              {/* Connector Chevron (visible on large screen lg grids) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-background rounded-full border border-border p-1">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              <span className="absolute right-3 top-2 font-heading text-xl font-extrabold text-secondary-foreground/15">
                {i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-heading text-sm font-bold text-spice-brown">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Layout: Horizontal scrolling timeline */}
        <div className="mt-6 md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-none">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex flex-col items-center bg-card border border-border rounded-2xl p-5 text-center shadow-soft min-w-[150px] snap-start shrink-0"
            >
              <span className="absolute right-3 top-2 font-heading text-lg font-extrabold text-secondary-foreground/15">
                {i + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-heading text-xs font-bold text-spice-brown">{s.title}</h3>
              <p className="mt-1 text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
