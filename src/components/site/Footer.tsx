import { Facebook, Instagram, Linkedin, ArrowRight } from "lucide-react";

const productLinks = [
  "Turmeric Powder",
  "Chilli Powder",
  "Coriander Powder",
  "Cumin Powder",
  "Garam Masala",
];
const quickLinks = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Our Products", href: "#products" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact Us", href: "#contact" },
];

export function Footer() {
  return (

    <footer className="bg-[#0a1520] text-white border-t border-white/10">
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1 text-left">
            <a href="#top" className="flex items-center gap-3 group">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 shadow-sm p-1">
                {/* SVG Logo matching user uploaded logo */}
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full"
                >
                  <path
                    d="M50 10 C65 20, 85 20, 85 45 C85 70, 50 90, 50 90 C50 90, 15 70, 15 45 C15 20, 35 20, 50 10 Z"
                    fill="#e8b72a"
                  />
                  <path
                    d="M50 22 C53 25, 60 30, 60 45 C60 62, 50 78, 50 78 C50 78, 40 62, 40 45 C40 30, 47 25, 50 22 Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M50 28 Q48 40 42 55 M50 35 Q52 48 58 60 M50 22 L50 78"
                    stroke="#e8b72a"
                    strokeWidth="3.5"
                    fill="none"
                  />
                </svg>
              </div>

              <div className="leading-none">
                <p className="font-heading text-lg font-extrabold text-white">Agrozaar</p>
                <p className="text-[0.65rem] font-bold tracking-[0.25em] text-gold mt-0.5">
                  FOODS LLP
                </p>
              </div>
            </a>

            <p className="mt-5 text-xs md:text-sm leading-relaxed text-white/70">
              Premium spice manufacturing and wholesale export under the flagship brand Aviraaj — bringing authentic purity and aroma to global B2B sectors.
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 transition-all hover:bg-gold hover:text-[#0a1520]"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="text-left">
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-gold">
              Products
            </h4>
            <ul className="mt-5 space-y-3">
              {productLinks.map((p) => (
                <li key={p}>
                  <a
                    href="#products"
                    className="text-xs md:text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-left">
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-gold">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-xs md:text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-left">
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-gold">
              Export Inquiry
            </h4>
            <p className="mt-5 text-xs md:text-sm text-white/70 leading-relaxed">
              Looking for a reliable spice sourcing partner for your international market? Connect with us today.
            </p>
            <a
              href="#contact"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold hover:bg-gold/90 text-[#0a1520] px-5 py-3 text-xs md:text-sm font-bold shadow-md transition-all duration-300 btn-shine"
            >
              Become a Partner <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-xs text-white/60 text-left">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="font-bold text-white mb-2 tracking-wide">Corporate Information</p>
              <p className="mt-1">
                <span className="font-semibold text-white/90">Entity Name:</span> Agrozaar Foods LLP
              </p>
              <p className="mt-1">
                <span className="font-semibold text-white/90">LLPIN:</span> ACY-2639
              </p>
              <p className="mt-1">
                <span className="font-semibold text-white/90">Incorporated on:</span> 15 May 2026
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2 tracking-wide">Registered Office</p>
              <p className="mt-1 leading-relaxed">
                GF 33 Samay Arcade, Patan Road,<br />
                Unjha, Mehsana, Gujarat, India - 384170
              </p>
              <p className="mt-1">
                <span className="font-semibold text-white/90">Processing Unit:</span> Khoraj, Gandhinagar, Gujarat
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2 tracking-wide">Designated Partners</p>
              <p className="mt-1">
                Meet Harshadkumar Patel<br />
                Sharad Harshadkumar Patel
              </p>
              <p className="mt-2 text-[10px] text-white/40 leading-normal">
                Agrozaar Foods LLP is a registered Limited Liability Partnership under the Ministry of Corporate Affairs (MCA), Government of India.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} Agrozaar Foods LLP. All rights reserved.</p>
            <p className="text-white/40">Premium Spice Manufacturing &amp; Global B2B Export</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

