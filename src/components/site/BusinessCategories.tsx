import { Building2, Truck, Store, Ship, Boxes } from "lucide-react";

const cats = [
  { icon: Building2, title: "B2B Supply", desc: "Reliable bulk supply for food processors and manufacturers." },
  { icon: Truck, title: "Distributors", desc: "Margin-friendly partnerships with regional distributors." },
  { icon: Store, title: "Retailers", desc: "Retail-ready packs under the Aviraaj brand." },
  { icon: Ship, title: "Export", desc: "Documentation and packaging for international buyers." },
  { icon: Boxes, title: "Bulk Orders", desc: "Custom volumes with consistent, repeatable quality." },
];

export function BusinessCategories() {
  return (
    <section className="section-pad bg-secondary/40">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Who We Serve</span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">Business categories we supply</h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {cats.map((c) => (
            <div key={c.title} className="group rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <c.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-heading text-base font-bold text-spice-brown">{c.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
