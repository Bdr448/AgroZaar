import { Globe2, FileCheck2, PackageCheck, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: FileCheck2,
    title: "FOB / CIF / CFR Support",
    desc: "Flexible shipping terms tailored to your import requirements.",
  },
  {
    icon: PackageCheck,
    title: "International Packaging",
    desc: "Moisture-proof, export-grade packaging in custom sizes.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Assurance",
    desc: "Batch documentation and lab reports for every consignment.",
  },
];

const countries = [
  "UAE",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Saudi Arabia",
  "Singapore",
  "Malaysia",
];

interface ExportProps {
  countries?: string[];
}

export function Export({ countries: customCountries }: ExportProps) {
  const displayCountries = (customCountries && customCountries.length > 0) ? customCountries : countries;

  return (
    <section id="export" className="py-6 md:py-12 bg-background">
      <div className="container-x grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Global Export
          </span>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold text-spice-brown text-balance">
            Trusted spice exports, worldwide
          </h2>
          <p className="mt-5 text-base md:text-lg leading-relaxed text-muted-foreground">
            We support international buyers with compliant documentation, dependable logistics and
            consistent product quality across every shipment.
          </p>

          {/* Inline country badges shown ONLY on mobile/tablets */}
          <div className="mt-6 flex flex-wrap gap-2 md:hidden">
            {displayCountries.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-spice-brown"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-6 md:hidden">
            <a
              href="#contact"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Start Export Inquiry
            </a>
          </div>

          {/* Features list shown ONLY on desktop */}
          <div className="mt-8 space-y-4 hidden md:block">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-spice-brown">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large card shown ONLY on desktop */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-spice-brown p-10 text-primary-foreground shadow-card hidden md:block">
          <Globe2 className="absolute -right-10 -top-10 h-56 w-56 text-primary-foreground/5" />
          <div className="relative">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Export Markets
            </p>
            <h3 className="mt-3 font-heading text-3xl font-extrabold">
              Serving buyers across continents
            </h3>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {displayCountries.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-sm font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-primary-foreground/10 p-5">
                <p className="font-heading text-2xl font-extrabold text-primary">{displayCountries.length}+</p>
                <p className="mt-1 text-xs text-primary-foreground/70">Target Countries</p>
              </div>
              <div className="rounded-2xl bg-primary-foreground/10 p-5">
                <p className="font-heading text-2xl font-extrabold text-primary">100%</p>
                <p className="mt-1 text-xs text-primary-foreground/70">Quality Checked</p>
              </div>
            </div>
            <a
              href="#contact"
              className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start an Export Inquiry
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
