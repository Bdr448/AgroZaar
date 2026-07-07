import { Globe, Award, ShieldCheck, Target, TrendingUp, Users, HeartHandshake, Zap } from "lucide-react";
import founder from "@/assets/founder.jpg.asset.json";

interface AboutProps {
  title?: string;
  text?: string;
  imageUrl?: string;
}

export function About({ title, text, imageUrl }: AboutProps) {
  const displayTitle = title || "Connecting Quality, Globally";
  const displayConfigText = text || "Agrozaar Foods LLP is a premier spice manufacturing and global export enterprise incorporated at Unjha, Mehsana, Gujarat. We source premium-grade raw materials directly from organic fields and regional mandis, processing them with low-temperature cool-grinding technology. This ensures natural volatile oils, rich color, and purity are completely preserved for wholesale food sectors globally.";
  const displayImage = imageUrl || founder.url;

  const highlights = [
    {
      icon: Globe,
      title: "Global Network",
      desc: "Operating across continents with strategic B2B export partnerships.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      desc: "Rigorous laboratory testing matching top international food safety benchmarks.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted Partner",
      desc: "Building long-term relationships founded on transparency and performance.",
    },
    {
      icon: Target,
      title: "Customer Focus",
      desc: "Providing custom packaging, custom blends, and tailored shipping solutions.",
    },
  ];

  const values = [
    { icon: TrendingUp, title: "Excellence", desc: "Striving for the highest quality in every spice product and service." },
    { icon: Users, title: "Partnership", desc: "Building lasting, reliable relationships with buyers and regional farming belts." },
    { icon: Globe, title: "Global Vision", desc: "Connecting wholesale spice markets across borders with cultural sensitivity." },
    { icon: ShieldCheck, title: "Integrity", desc: "Conducting international trade with honesty, ethics, and full compliance." },
    { icon: Zap, title: "Innovation", desc: "Embracing advanced cool-grinding milling and sorting technologies." },
    { icon: HeartHandshake, title: "Reliability", desc: "Delivering on our promises consistently, dependably, and on schedule." },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-gray-50 text-left">
      <div className="container-x">
        {/* About Main info */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-20">
          <div className="w-full lg:w-2/5">
            <div className="relative w-full max-w-md mx-auto">
              <div className="bg-[#0a1520] p-1.5 rounded-2xl shadow-2xl overflow-hidden border border-white/5">
                <img
                  src={displayImage}
                  alt="Agrozaar Foods Processing"
                  className="w-full h-auto rounded-xl transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/5">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                About Agrozaar Foods
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a1520] tracking-tight">
                {displayTitle}
              </h2>
              <div className="w-20 h-1 bg-[#d4af37] rounded-full"></div>
            </div>

            <p className="mt-6 text-sm md:text-base leading-relaxed text-gray-700">
              {displayConfigText}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#0a1520] flex items-center justify-center mr-4 shrink-0 shadow-sm border border-white/10">
                    <h.icon className="h-5 w-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a1520] text-sm md:text-base">{h.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Values Sub-section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-[#0a1520]">Our Core Values</h3>
            <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#d4af37] card-animate text-left"
              >
                <div className="flex items-center mb-3">
                  <div className="mr-3 p-2 bg-[#0a1520]/5 rounded-full">
                    <v.icon className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg">{v.title}</h4>
                </div>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

