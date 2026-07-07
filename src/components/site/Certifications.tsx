export function Certifications() {
  const certs = [
    {
      name: "FSSAI",
      desc: "Food Safety and Standards Authority of India",
      code: "Reg. No. 10726999000321",
      svg: (
        <svg viewBox="0 0 100 100" className="h-16 w-16 mx-auto mb-2 text-[#d4af37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
          <path d="M50 20 L65 42 L35 42 Z M50 80 L65 58 L35 58 Z" />
          <text x="50" y="53" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">SAFETY</text>
        </svg>
      )
    },
    {
      name: "APEDA",
      desc: "Agricultural & Processed Food Products Export Development Authority",
      code: "Government of India Licensed",
      svg: (
        <svg viewBox="0 0 100 100" className="h-16 w-16 mx-auto mb-2 text-[#d4af37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M50 15 C55 35 75 50 75 50 C75 50 55 65 50 85 C45 65 25 50 25 50 C25 50 45 35 50 15 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="8" fill="currentColor" />
          <text x="50" y="93" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="currentColor">APEDA REGISTERED</text>
        </svg>
      )
    },
    {
      name: "SPICES BOARD",
      desc: "Spices Board India, Ministry of Commerce & Industry",
      code: "Export Registration Holder",
      svg: (
        <svg viewBox="0 0 100 100" className="h-16 w-16 mx-auto mb-2 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="50" cy="50" r="45" strokeWidth="2.5" />
          <path d="M50 20 C60 40 80 50 80 50 C80 50 60 60 50 80 C40 60 20 50 20 50 C20 50 40 40 50 20 Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" />
          <path d="M50 36 L50 64 M36 50 L64 50" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      name: "ISO 22000",
      desc: "Food Safety Management System Quality Certified",
      code: "HACCP & GMP Compliant",
      svg: (
        <svg viewBox="0 0 100 100" className="h-16 w-16 mx-auto mb-2 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="50,12 85,32 85,72 50,92 15,72 15,32" strokeWidth="2.5" />
          <polygon points="50,20 78,36 78,68 50,84 22,68 22,36" fill="currentColor" fillOpacity="0.1" />
          <text x="50" y="55" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor">ISO</text>
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white text-[#0a1520] text-center border-t border-gray-150">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Compliance & Standards
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
            Membership & Certifications
          </h2>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto text-sm md:text-base">
            Our unwavering commitment to quality and purity is validated through credentials with leading trade regulatory organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mt-10">
          {certs.map((c, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg hover:border-[#d4af37]/45 text-center flex flex-col justify-between"
            >
              <div>
                {c.svg}
                <h3 className="font-extrabold text-[#0a1520] text-lg mt-3 mb-1">{c.name}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-normal px-2">
                  {c.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {c.code}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-4xl mx-auto bg-gray-50 p-8 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-[#0a1520] mb-2">Trusted Global Exporter</h3>
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
            Every export consignment of Aviraaj Spices complies fully with the standard procedures of the Spices Board of India and gets cleared through stringent phytosanitary lab testing reports.
          </p>
        </div>
      </div>
    </section>
  );
}
