import { Check } from "lucide-react";
import founder from "@/assets/founder.jpg.asset.json";

const points = [
  "Directly sourced from Deesa Mandi & partner farmers in North Gujarat",
  "Milled using Volatile Oil Retention (VOR) cool-grinding technology",
  "100% sortex clean, free from artificial colors, starch, or chemical fillers",
  "Sturdy double-walled packaging designed for international B2B shipments",
];

interface AboutProps {
  title?: string;
  text?: string;
  imageUrl?: string;
}

export function About({ title, text, imageUrl }: AboutProps) {
  const displayTitle = title || "Our Story: Bridging Indian Farms to Global Tables";
  const displayConfigText = text || "Agrozaar Foods LLP was born out of the fertile soil of Deesa, Gujarat. Founded by Sharad Patel, whose family has farmed in Banaskantha for generations, our mission is to deliver pure, unadulterated spices under our flagship brand Aviraaj. By sourcing directly from regional farms, we ensure that every batch of turmeric, cumin, and chilli retains its natural oils and export-grade purity.";
  const displayImage = imageUrl || founder.url;

  return (
    <section id="about" className="py-6 md:py-12 bg-background">
      <div className="container-x grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative order-2 lg:order-1 hidden md:block">
          <div className="overflow-hidden rounded-3xl border border-border shadow-card">
            <img
              src={displayImage}
              alt="Sharad Patel, Founder & CEO of Agrozaar Foods LLP"
              width={800}
              height={800}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover max-h-[260px] md:max-h-[500px]"
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
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold leading-tight text-spice-brown text-balance">
            {displayTitle}
          </h2>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-muted-foreground">
            {displayConfigText}
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
              <div key={l} className="rounded-xl border border-border bg-card p-3 shadow-soft text-center">
                <p className="font-heading text-lg font-extrabold text-primary">{n}</p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
