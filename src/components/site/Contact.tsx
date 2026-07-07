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
    const message = formData.get("message") as string;

    try {
      const { error } = await supabase.from("customers").insert([
        {
          name,
          company: company || "Website Inquiry",
          email,
          phone,
          notes: message,
          is_lead: true,
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
    <section id="contact" className="py-16 md:py-24 bg-gray-50 text-[#0a1520] text-left border-t border-gray-150">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Side: Contact Details */}
        <div className="w-full text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Get in Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
            Connect With Our designated Export Team
          </h2>
          <div className="w-20 h-1 bg-[#d4af37] mt-4 rounded-full"></div>
          <p className="mt-6 text-sm md:text-base text-gray-600 leading-relaxed">
            Distributors, international buyers, and retail chains can request custom packaging specifications, private-label blends, or formal export proposal pricing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {details.map((d, i) => (
              <a
                key={i}
                href={d.href ?? "#"}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#d4af37]/45"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0a1520] text-[#d4af37] border border-white/5 shadow-sm">
                  <d.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    {d.label}
                  </p>
                  <p className="mt-1 text-xs md:text-sm font-bold text-gray-800 break-words leading-tight">{d.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://wa.me/918128853311"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#25D366] hover:bg-[#25D366]/90 text-white px-6 py-3 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              💬 Chat on WhatsApp
            </a>
            <div className="flex items-center text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-md px-4 py-3 shadow-sm">
              🕒 Office Hours: Mon-Sat, 9:30 AM - 7:30 PM
            </div>
          </div>
        </div>

        {/* Right Side: Inquiry Form */}
        <div className="w-full">
          <form
            onSubmit={onSubmit}
            className="w-full rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-lg flex flex-col text-left"
          >
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0a1520] mb-1">
              Send B2B Export Inquiry
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Get lab certifications, product catalogs, and custom proposals sent directly to you.
            </p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="name" placeholder="Your name" />
                <Field label="Company" name="company" placeholder="Company name" required={false} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" name="email" type="email" placeholder="you@email.com" />
                <Field label="Phone / WhatsApp" name="phone" placeholder="+91 ..." />
              </div>
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-bold text-gray-700 text-left" htmlFor="message">
                  Requirement Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  required
                  placeholder="Describe your required spices, quantities, packaging configurations..."
                  className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs sm:text-sm outline-none transition-colors focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-left"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0a1520] py-3 text-xs sm:text-sm font-bold shadow-md transition-all duration-300 hover:shadow-[#d4af37]/25 hover:-translate-y-0.5 cursor-pointer btn-shine"
              >
                <Send className="h-4 w-4" /> {sent ? "Inquiry Sent Successfully!" : "Submit B2B Inquiry"}
              </button>
              {sent && (
                <p className="text-xs text-emerald-600 font-bold mt-2 text-center">
                  Thank you! We have received your inquiry. Our partners will reply within 2 hours.
                </p>
              )}
            </div>
          </form>
        </div>
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
      <label className="text-xs sm:text-sm font-bold text-gray-700 text-left" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm outline-none transition-colors focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-left"
      />
    </div>
  );
}

