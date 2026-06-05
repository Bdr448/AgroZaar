import { Wheat, Droplets, Cog, Blend, Package, Send } from "lucide-react";
import manufacturing from "@/assets/manufacturing.jpg";

const steps = [
  { icon: Wheat, title: "Raw Material", desc: "Sourcing & sorting" },
  { icon: Droplets, title: "Cleaning", desc: "Washing & drying" },
  { icon: Cog, title: "Grinding", desc: "Precision milling" },
  { icon: Blend, title: "Blending", desc: "Consistent mixing" },
  { icon: Package, title: "Packing", desc: "Sealed packaging" },
  { icon: Send, title: "Dispatch", desc: "Timely delivery" },
];

export function ManufacturingProcess() {
  return (
    <section id="process" className="section-pad bg-secondary/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Manufacturing</span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">From raw material to dispatch</h2>
          <p className="mt-4 text-muted-foreground">A controlled, hygienic process that protects color, aroma and purity at every step.</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-border shadow-card">
          <img src={manufacturing} alt="Modern spice manufacturing facility" width={1280} height={854} loading="lazy" className="h-64 w-full object-cover md:h-80" />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <span className="absolute right-4 top-3 font-heading text-2xl font-extrabold text-secondary-foreground/15">{i + 1}</span>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-heading text-sm font-bold text-spice-brown">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
