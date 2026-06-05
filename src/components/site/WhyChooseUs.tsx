import { Sparkles, ShieldCheck, Globe2, Factory, FlaskConical, Soup } from "lucide-react";

const items = [
  { icon: Sparkles, title: "100% Pure", desc: "No fillers or adulteration — only authentic, single-origin spices." },
  { icon: ShieldCheck, title: "Hygienically Processed", desc: "Clean, controlled environments at every stage of production." },
  { icon: Globe2, title: "Export Quality", desc: "Meeting international grading and packaging standards." },
  { icon: Factory, title: "Advanced Manufacturing", desc: "Modern grinding and blending lines for consistent output." },
  { icon: FlaskConical, title: "Lab Tested", desc: "Batch-wise testing for color, purity, moisture and safety." },
  { icon: Soup, title: "Rich Aroma & Taste", desc: "Carefully processed to preserve natural flavor and color." },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="section-pad">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Why Choose Us</span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">Quality you can build a business on</h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-bold text-spice-brown">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
