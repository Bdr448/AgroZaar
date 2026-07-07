import { Sparkles, ShieldCheck, Globe, Factory, FlaskConical, Leaf } from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Direct Farm Sourcing",
    desc: "Single-origin spices sourced straight from Banaskantha mandis and regional farming partners.",
  },
  {
    icon: ShieldCheck,
    title: "FSSAI & GMP Standards",
    desc: "Meticulously processed in fully licensed, hygienic facilities matching international safety codes.",
  },
  {
    icon: Globe,
    title: "Global Export Grade",
    desc: "Phytosanitary cleared and moisture-controlled packaging designed for long sea voyages.",
  },
  {
    icon: Factory,
    title: "Cool-Grinding Milling",
    desc: "Low-temperature grinding retains natural volatile oils and original flavor profiles.",
  },
  {
    icon: FlaskConical,
    title: "NABL Lab Tested",
    desc: "Batch-tested for curcumin percentages, capsaicin heat levels, and safety clearances.",
  },
  {
    icon: Leaf,
    title: "Zero Preservatives",
    desc: "100% natural spices, completely free from artificial colors, starches, or chemical fillers.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="py-16 md:py-24 bg-gray-50 text-left">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-[#0a1520] tracking-tight">
            Quality You Can Build a Business On
          </h2>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Agrozaar Foods LLP stands apart as your premier partner for wholesale Indian spice supply, guaranteeing purity and compliance at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0a1520] hover:border-t-4 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col text-left border border-gray-100"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0a1520]/5 flex items-center justify-center mb-4">
                <it.icon className="h-6 w-6 text-[#d4af37]" />
              </div>
              <h3 className="font-bold text-[#0a1520] text-lg mb-2">{it.title}</h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

