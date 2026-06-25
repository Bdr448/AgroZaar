import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { BusinessCategories } from "@/components/site/BusinessCategories";
import { Export } from "@/components/site/Export";
import { ManufacturingProcess } from "@/components/site/ManufacturingProcess";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { Send, Phone, Mail, MapPin } from "lucide-react";

export default function HomePage() {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("landing_page_settings")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error loading landing page settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // Realign scroll position to match URL hash to prevent layout shift misalignment after settings load
  useEffect(() => {
    const getHashId = () => {
      const hash = window.location.hash;
      if (!hash) return null;
      const cleanHash = hash.replace(/^#\/?/, "");
      if (cleanHash === "login" || cleanHash.startsWith("app") || cleanHash === "unauthorized" || cleanHash.startsWith("forgot") || cleanHash.startsWith("reset")) {
        return null;
      }
      return cleanHash;
    };

    const targetId = getHashId();
    if (targetId) {
      if (["about", "products", "export", "process", "reviews", "contact"].includes(targetId)) {
        setActiveTab(targetId);
        const scrollToElement = () => {
          const el = document.getElementById("main-content-tabs");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        };
        scrollToElement();
      }
    }
  }, [settings]);

  // Intercept all hash link clicks to guarantee smooth scrolling even if hash is unchanged
  useEffect(() => {
    const handleHashClick = (e) => {
      const target = e.target;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          const cleanId = href.replace(/^#\/?/, "");
          if (cleanId === "login" || cleanId.startsWith("app") || cleanId === "unauthorized" || cleanId.startsWith("forgot") || cleanId.startsWith("reset")) {
            return;
          }
          if (["about", "products", "export", "process", "reviews", "contact"].includes(cleanId)) {
            e.preventDefault();
            setActiveTab(cleanId);
            const el = document.getElementById("main-content-tabs");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
            window.history.pushState(null, "", href);
          }
        }
      }
    };

    window.addEventListener("click", handleHashClick, true);
    return () => {
      window.removeEventListener("click", handleHashClick, true);
    };
  }, []);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const company = formData.get("company");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const message = formData.get("message");

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
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Navbar />

      <main className="flex-1 container-x py-6 lg:py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Hero info + B2B Inquiry form */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="space-y-3.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Spice Manufacturing & Global Export
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight text-spice-brown">
                {settings?.hero_title || "Pure Spices Direct From India's Golden Farming Belts"}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {settings?.hero_subtitle || "Sourced straight from the organic fields of Deesa, Gujarat. Processed with low-temperature cool-grinding to preserve natural volatile oils, purity, and rich aroma — certified export-grade under flagship brand Aviraaj."}
              </p>
              {settings?.hero_image_url && (
                <div className="rounded-2xl overflow-hidden border border-border shadow-soft w-full h-36 mt-2">
                  <img
                    src={settings.hero_image_url}
                    alt="Agrozaar Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs font-bold text-foreground/80 pt-1">
                <span className="flex items-center gap-1">🛡️ Lab Tested</span>
                <span className="flex items-center gap-1">🌍 Export Grade</span>
              </div>
            </div>

            {/* Desktop-only Inquiry Form */}
            <div className="hidden lg:block">
              <InquiryForm sent={sent} onSubmit={handleInquirySubmit} />
            </div>
          </div>

          {/* Right Column: Tabbed Content Switcher */}
          <div className="lg:col-span-7 flex flex-col gap-5" id="main-content-tabs">
            {/* Sticky/Fixed-style Tab bar */}
            <div className="border-b border-border bg-card rounded-2xl p-2 shadow-soft flex gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: "about", label: "Our Story" },
                { id: "products", label: "Aviraaj Spices" },
                { id: "export", label: "Global Export" },
                { id: "process", label: "Process & Compliance" },
                { id: "reviews", label: "Client Reviews" },
                { id: "contact", label: "Direct Contact" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.history.pushState(null, "", `#${tab.id}`);
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-card rounded-3xl border border-border/80 shadow-card overflow-hidden">
              {activeTab === "about" && (
                <About
                  title={settings?.about_title}
                  text={settings?.about_text}
                  imageUrl={settings?.about_image_url}
                />
              )}
              {activeTab === "products" && (
                <Products spices={settings?.products_data} />
              )}
              {activeTab === "export" && (
                <div className="space-y-4">
                  <Export countries={settings?.export_countries} />
                  <BusinessCategories />
                </div>
              )}
              {activeTab === "process" && (
                <div className="space-y-4">
                  <WhyChooseUs />
                  <ManufacturingProcess />
                </div>
              )}
              {activeTab === "reviews" && (
                <Testimonials />
              )}
              {activeTab === "contact" && (
                <DirectContactTab />
              )}
            </div>

            {/* Mobile-only Inquiry Form (renders below active tab details) */}
            <div className="block lg:hidden mt-4">
              <InquiryForm sent={sent} onSubmit={handleInquirySubmit} />
            </div>

          </div>

        </div>
      </main>

      <Footer />

      {/* Floating Sticky WhatsApp Button */}
      <a
        href="https://wa.me/918128853311"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </a>
    </div>
  );
}

function InquiryForm({ sent, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-border bg-card p-5 shadow-card flex flex-col text-left"
    >
      <h3 className="font-heading text-sm font-bold text-spice-brown uppercase tracking-wider">Send B2B Export Inquiry</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5">Get a customized proposal and lab certifications directly to your desk.</p>
      
      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide" htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="Company name"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide" htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              required
              placeholder="+91 ..."
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide" htmlFor="message">Requirement Details</label>
          <textarea
            id="message"
            name="message"
            rows={2}
            required
            placeholder="Describe spices, packing configurations & volume needed..."
            className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
        
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Send className="h-3 w-3" /> Submit B2B Inquiry
        </button>
        {sent && <p className="text-[11px] text-emerald-600 font-semibold mt-1">Inquiry sent successfully! We'll reply within 2 hours.</p>}
      </div>
    </form>
  );
}

function DirectContactTab() {
  return (
    <div className="p-6 md:p-8 space-y-6 text-left">
      <h3 className="font-heading text-xl font-bold text-spice-brown">Direct Contact Information</h3>
      <p className="text-sm text-muted-foreground">Reach our designated partners or visit our processing and export facilities in Gujarat.</p>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <a href="tel:+918128853311" className="flex items-start gap-3 rounded-xl border border-border p-4 bg-secondary/30 hover:shadow-soft transition-all">
          <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Phone</p>
            <p className="text-sm font-semibold mt-0.5 text-foreground">+91 81288 53311</p>
          </div>
        </a>
        <a href="mailto:sharadpatel2306@gmail.com" className="flex items-start gap-3 rounded-xl border border-border p-4 bg-secondary/30 hover:shadow-soft transition-all">
          <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email</p>
            <p className="text-sm font-semibold mt-0.5 text-foreground break-all">sharadpatel2306@gmail.com</p>
          </div>
        </a>
        <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-secondary/30 sm:col-span-2">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Head Office</p>
            <p className="text-sm font-semibold mt-0.5 text-foreground">GF 33 Samay Arcade, Patan Road, Unjha, Mehsana, Gujarat, India - 384170</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border p-4 bg-secondary/30 sm:col-span-2">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Processing Unit</p>
            <p className="text-sm font-semibold mt-0.5 text-foreground">Khoraj, Gandhinagar, Gujarat</p>
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <a
          href="https://wa.me/918128853311"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          💬 Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
