import { ArrowRight, ShieldCheck, BadgeCheck } from "lucide-react";
import heroImg from "@/assets/hero-turmeric.jpg";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-secondary/50">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-1.5 text-xs font-semibold tracking-wide text-spice-brown">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Spice Manufacturing & Export · Gujarat, India
          </span>

          <h1 className="mt-6 font-heading text-5xl font-extrabold leading-[1.05] text-spice-brown text-balance md:text-6xl">
            Pure Spices.<br /><span className="text-primary">Pure Trust.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Premium quality spices for B2B, retail, distributors, and export markets — crafted with modern processing and uncompromised purity under our brand <span className="font-semibold text-foreground">Aviraaj</span>.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#products" className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5">
              Explore Products <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-7 py-3.5 text-sm font-semibold text-spice-brown transition-colors hover:bg-secondary">
              Contact Us
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-foreground/80">Lab Tested Quality</span>
            </div>
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-foreground/80">Export Grade Standards</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <img src={heroImg} alt="Bowl of premium golden turmeric powder with turmeric roots" width={1280} height={1280} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 left-6 rounded-2xl border border-border bg-card px-6 py-4 shadow-card">
            <p className="font-heading text-2xl font-extrabold text-primary">100%</p>
            <p className="text-xs font-medium text-muted-foreground">Natural & Pure</p>
          </div>
          <div className="absolute -right-3 top-8 rounded-2xl border border-border bg-card px-5 py-3 shadow-card">
            <p className="font-heading text-lg font-extrabold text-spice-brown">Aviraaj</p>
            <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground">Flagship Brand</p>
          </div>
        </div>
      </div>
    </section>
  );
}
