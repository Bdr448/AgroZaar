import { Leaf, Facebook, Instagram, Linkedin, ArrowRight } from "lucide-react";

const productLinks = [
  "Turmeric Powder",
  "Chilli Powder",
  "Coriander Powder",
  "Cumin Powder",
  "Garam Masala",
];
const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Export", href: "#export" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="bg-spice-brown text-primary-foreground">
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </span>
              <div className="leading-none">
                <p className="font-heading text-lg font-extrabold">Agrozaar</p>
                <p className="text-[0.65rem] font-medium tracking-[0.22em] text-primary-foreground/60">
                  FOODS LLP
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-primary-foreground/70">
              Premium spice manufacturing and export under the flagship brand Aviraaj — bringing the
              true taste of Indian spices worldwide.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "https://linkedin.com/in/sharad-patel-8935732b9" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
              Products
            </h4>
            <ul className="mt-5 space-y-3">
              {productLinks.map((p) => (
                <li key={p}>
                  <a
                    href="#products"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
              Export Inquiry
            </h4>
            <p className="mt-5 text-sm text-primary-foreground/70">
              Looking for a reliable spice supply partner for your market?
            </p>
            <a
              href="#contact"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Become a Partner <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/15 pt-8 text-xs text-primary-foreground/60">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-semibold text-primary">Corporate Information</p>
              <p className="mt-2">
                <span className="font-medium text-primary-foreground/85">Entity Name:</span> Agrozaar Foods LLP
              </p>
              <p className="mt-1">
                <span className="font-medium text-primary-foreground/85">LLPIN:</span> ACY-2639
              </p>
              <p className="mt-1">
                <span className="font-medium text-primary-foreground/85">Incorporated on:</span> 15 May 2026
              </p>
            </div>
            <div>
              <p className="font-semibold text-primary">Registered Office</p>
              <p className="mt-2 leading-relaxed">
                GF 33 Samay Arcade, Patan Road,<br />
                Unjha, Mehsana, Gujarat, India - 384170
              </p>
              <p className="mt-1">
                <span className="font-medium text-primary-foreground/85">Processing Unit:</span> Khoraj, Gandhinagar, Gujarat
              </p>
            </div>
            <div>
              <p className="font-semibold text-primary">Designated Partners</p>
              <p className="mt-2">
                Meet Harshadkumar Patel<br />
                Sharad Harshadkumar Patel
              </p>
              <p className="mt-2 text-[10px] text-primary-foreground/45 leading-normal">
                Agrozaar Foods LLP is a registered Limited Liability Partnership under the Ministry of Corporate Affairs (MCA), Government of India.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/10 pt-6 text-sm sm:flex-row">
            <p>© {new Date().getFullYear()} Agrozaar Foods LLP. All rights reserved.</p>
            <p className="text-xs">Premium Spice Manufacturing &amp; Global B2B Export</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
