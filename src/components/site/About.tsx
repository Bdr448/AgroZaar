import { Check } from "lucide-react";
import founder from "@/assets/founder.jpg.asset.json";

const points = [
  "Specialized in turmeric, chilli, coriander, cumin, garam masala & custom blends",
  "Serving B2B, distributors, retailers and export buyers",
  "Modern processing techniques with traditional purity",
  "Hygiene, consistency and customer satisfaction in every batch",
];

export function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-3xl border border-border shadow-card">
            <img
              src={founder.url}
              alt="Sharad Patel, Founder & CEO of Agrozaar Foods LLP"
              width={800}
              height={800}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-border bg-card/95 px-6 py-4 shadow-card backdrop-blur">
            <p className="font-heading text-lg font-bold text-spice-brown">Sharad Patel</p>
            <p className="text-sm text-muted-foreground">Founder &amp; CEO, Agrozaar Foods LLP</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            About the Company
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-spice-brown text-balance">
            A growing name in the Indian spice industry
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Agrozaar Foods LLP is a spice manufacturing and export company committed to delivering
            high-quality, pure and authentic spices under its flagship brand{" "}
            <span className="font-semibold text-foreground">Aviraaj</span>. We bring the true taste
            of Indian spices to every kitchen — domestic and international.
          </p>

          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-foreground/85">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 grid grid-cols-3 gap-4">
            {[
              ["2026", "Founded"],
              ["100%", "Pure & Natural"],
              ["Global", "Export Ready"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <p className="font-heading text-2xl font-extrabold text-primary">{n}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
