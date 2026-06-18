import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

const details = [
  { icon: Phone, label: "Phone", value: "+91 81288 53311", href: "tel:+918128853311" },
  {
    icon: Mail,
    label: "Email",
    value: "sharadpatel2306@gmail.com",
    href: "mailto:sharadpatel2306@gmail.com",
  },
  { icon: MapPin, label: "Head Office", value: "GF 33 Samay Arcade, Patan Road, Unjha, Mehsana, Gujarat, India - 384170" },
  { icon: MapPin, label: "Processing Unit", value: "Khoraj, Gandhinagar, Gujarat" },
];

export function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;

    try {
      const { error } = await supabase.from("customers").insert([
        {
          name,
          company: company || "Website Inquiry",
          email,
          phone,
        },
      ]);
      if (error) {
        console.error("Failed to save lead:", error.message);
      }
    } catch (err) {
      console.error("Error inserting lead:", err);
    }
    setSent(true);
  };

  return (
    <section id="contact" className="py-6 md:py-12 bg-secondary/40">
      <div className="container-x grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="w-full min-w-0">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Get in Touch
          </span>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-extrabold text-spice-brown text-balance">
            Let's discuss your spice requirement
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Whether you're a distributor, retailer or export buyer, our team will get back to you
            with a tailored proposal.
          </p>

          <div className="relative mt-6 overflow-hidden w-full">
            {/* Gradient Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused] py-2">
              {/* First Set */}
              <div className="flex shrink-0">
                {details.map((d) => (
                  <a
                    key={`c1-${d.label}`}
                    href={d.href ?? "#"}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-card w-[280px] md:w-[320px] shrink-0 mr-4 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {d.label}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">{d.value}</p>
                    </div>
                  </a>
                ))}
              </div>
              {/* Second Set */}
              <div className="flex shrink-0" aria-hidden="true">
                {details.map((d) => (
                  <a
                    key={`c2-${d.label}`}
                    href={d.href ?? "#"}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-card w-[280px] md:w-[320px] shrink-0 mr-4 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {d.label}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">{d.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/918128853311"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-7 shadow-card flex flex-col text-left"
        >
          <h3 className="font-heading text-base sm:text-lg font-bold text-spice-brown text-left">Send an Inquiry</h3>
          <div className="mt-3 sm:mt-4 flex flex-col gap-2.5 sm:gap-3">
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="flex-1">
                <Field label="Full Name" name="name" placeholder="Your name" />
              </div>
              <div className="flex-1">
                <Field label="Company" name="company" placeholder="Company name" required={false} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="flex-1">
                <Field label="Email" name="email" type="email" placeholder="you@email.com" />
              </div>
              <div className="flex-1">
                <Field label="Phone" name="phone" placeholder="+91 ..." />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs sm:text-sm font-medium text-foreground/80 text-left" htmlFor="message">
                Requirement
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                required
                placeholder="Tell us about the products and quantities you need..."
                className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-left"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> {sent ? "Inquiry Sent — Thank You!" : "Submit Inquiry"}
            </button>
            {sent && <p className="text-xs text-accent text-left">We'll get back to you shortly.</p>}
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs sm:text-sm font-medium text-foreground/80 text-left" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-left"
      />
    </div>
  );
}
