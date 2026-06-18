import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Mehta",
    role: "Distributor, Mumbai",
    text: "Consistent color and aroma batch after batch. Aviraaj turmeric has become a staple in our retail network.",
  },
  {
    name: "Imran Khalid",
    role: "Importer, UAE",
    text: "Professional documentation and export-grade packaging made the whole process smooth. Highly dependable supplier.",
  },
  {
    name: "Anita Sharma",
    role: "Wholesaler, Ahmedabad",
    text: "Pure, hygienic and well-priced. Our customers trust the quality and we keep reordering.",
  },
];

export function Testimonials() {
  return (
    <section className="section-pad">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Testimonials
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">
            Trusted by distributors &amp; buyers
          </h2>
        </div>

        <div className="relative mt-14 overflow-hidden w-full">
          {/* Gradient Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] py-4">
            {/* First Set */}
            <div className="flex shrink-0">
              {testimonials.map((t) => (
                <figure
                  key={`t1-${t.name}`}
                  className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-soft w-[300px] md:w-[380px] shrink-0 mr-6 text-left"
                >
                  <Quote className="h-8 w-8 text-primary/30" />
                  <div className="mt-4 flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-foreground/85">"{t.text}"</blockquote>
                  <figcaption className="mt-6 border-t border-border pt-5">
                    <p className="font-heading font-bold text-spice-brown">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            {/* Second Set */}
            <div className="flex shrink-0" aria-hidden="true">
              {testimonials.map((t) => (
                <figure
                  key={`t2-${t.name}`}
                  className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-soft w-[300px] md:w-[380px] shrink-0 mr-6 text-left"
                >
                  <Quote className="h-8 w-8 text-primary/30" />
                  <div className="mt-4 flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-foreground/85">"{t.text}"</blockquote>
                  <figcaption className="mt-6 border-t border-border pt-5">
                    <p className="font-heading font-bold text-spice-brown">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
