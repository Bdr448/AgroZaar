import { Globe, Package, Truck, ShieldCheck, BarChart, Headphones } from "lucide-react";
import manufacturingImg from "@/assets/manufacturing.jpg";

export function WhatWeDo() {
  const items = [
    {
      icon: Globe,
      title: "Global Sourcing",
      desc: "Sourcing premium agricultural commodities directly from audited growers in India.",
    },
    {
      icon: Package,
      title: "Product Development",
      desc: "Custom milling specifications, private-label packaging, and unique spice blend formulation.",
    },
    {
      icon: Truck,
      title: "Logistics Solutions",
      desc: "Seamless freight management, cargo consolidation, and end-to-end custom clearances.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Assurance",
      desc: "Comprehensive NABL lab-testing reports (curcumin content, moisture control, sanitization).",
    },
    {
      icon: BarChart,
      title: "Market Analysis",
      desc: "Up-to-date reports on agricultural mandi prices, export regulations, and seasonal crops.",
    },
    {
      icon: Headphones,
      title: "Trade Support",
      desc: "Full assistance with phytosanitary certificates, certificate of origin, and bank documentations.",
    },
  ];

  return (
    <section className="py-16 md:py-24 relative bg-black text-white text-left">
      <div className="absolute inset-0">
        <img
          src={manufacturingImg}
          alt="What We Do Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#0a1520]/80" />
      </div>

      <div className="container-x relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
            Comprehensive Supply Chain Management
          </h2>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            We handle the complete export process from farm sourcing to final delivery, ensuring quality, speed, and safety at every node.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Grid of services */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-start p-5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <div className="flex-shrink-0 mr-4 w-12 h-12 rounded-full bg-[#0a1520] flex items-center justify-center border border-[#d4af37]/30">
                    <it.icon className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold mb-1 text-white">{it.title}</h3>
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed">{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side banner */}
          <div className="lg:col-span-5">
            <div className="relative h-[360px] md:h-[400px] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={manufacturingImg}
                alt="Agrozaar Export Operations"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a1520]/95 via-[#0a1520]/70 to-transparent flex items-center text-left">
                <div className="p-8 max-w-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                    Trade Excellence
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold mt-2 mb-3 text-white leading-tight">
                    Global Trade Excellence
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Our customized logistics approaches ensure that sea-cargo spice shipments maintain stable moisture, retain natural essential oils, and arrive fresh at international destinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
