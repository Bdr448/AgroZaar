import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";

const details = [
  { icon: Phone, label: "Phone", value: "+91 90000 00000", href: "tel:+919000000000" },
  {
    icon: Mail,
    label: "Email",
    value: "info@agrozaarfoods.com",
    href: "mailto:info@agrozaarfoods.com",
  },
  { icon: MapPin, label: "Head Office", value: "Unjha, Gujarat, India" },
  { icon: MapPin, label: "Processing Unit", value: "Khoraj, Gandhinagar, Gujarat" },
];

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="section-pad bg-secondary/40">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Get in Touch
          </span>
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-spice-brown text-balance">
            Let's discuss your spice requirement
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whether you're a distributor, retailer or export buyer, our team will get back to you
            with a tailored proposal.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {details.map((d) => (
              <a
                key={d.label}
                href={d.href ?? "#"}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <d.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {d.label}
                  </p>
                  <p className="mt-1 font-medium text-foreground">{d.value}</p>
                </div>
              </a>
            ))}
          </div>

          <a
            href="https://wa.me/919000000000"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
          </a>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-3xl border border-border bg-card p-7 shadow-card md:p-9"
        >
          <h3 className="font-heading text-xl font-bold text-spice-brown">Send an Inquiry</h3>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" name="name" placeholder="Your name" />
              <Field label="Company" name="company" placeholder="Company name" required={false} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" placeholder="you@email.com" />
              <Field label="Phone" name="phone" placeholder="+91 ..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80" htmlFor="message">
                Requirement
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="Tell us about the products and quantities you need..."
                className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" /> {sent ? "Inquiry Sent — Thank You!" : "Submit Inquiry"}
            </button>
            {sent && <p className="text-sm text-accent">We'll get back to you shortly.</p>}
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
    <div>
      <label className="text-sm font-medium text-foreground/80" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
