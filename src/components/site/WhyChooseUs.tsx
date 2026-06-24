import { Sparkles, ShieldCheck, Globe2, Factory, FlaskConical, Soup } from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Direct Farm Sourcing",
    desc: "Single-origin spices sourced straight from Banaskantha mandis and regional partners.",
  },
  {
    icon: ShieldCheck,
    title: "FSSAI & GMP Standards",
    desc: "Meticulously processed in fully licensed, hygienic facilities matching international safety codes.",
  },
  {
    icon: Globe2,
    title: "Global Export Grade",
    desc: "Phytosanitary cleared and moisture-controlled packaging designed for long sea voyages.",
  },
  {
    icon: Factory,
    title: "Cool-Grinding Milling",
    desc: "Low-temperature grinding retains natural volatile oils and original flavor profiles.",
  },
  {
    icon: FlaskConical,
    title: "NABL Lab Tested",
    desc: "Batch-tested for curcumin percentages, capsaicin heat levels, and safety clearances.",
  },
  {
    icon: Soup,
    title: "Zero Preservatives",
    desc: "100% natural spices, completely free from artificial colors, starches, or chemical fillers.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="section-pad">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Why Choose Us
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">
            Quality you can build a business on
          </h2>
        </div>

        <div className="mt-8 md:mt-14 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-7 shadow-soft transition-shadow hover:shadow-card"
            >
              <span className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-4 w-4 md:h-6 md:w-6" />
              </span>
              <h3 className="mt-3 md:mt-5 font-heading text-sm md:text-lg font-bold text-spice-brown">{it.title}</h3>
              <p className="mt-1 md:mt-2 text-[10px] md:text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
