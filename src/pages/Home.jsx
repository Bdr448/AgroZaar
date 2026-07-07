import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { WhatWeDo } from "@/components/site/WhatWeDo";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Certifications } from "@/components/site/Certifications";
import { Gallery } from "@/components/site/Gallery";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export default function HomePage() {
  const [settings, setSettings] = useState(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground scroll-smooth">
      <Navbar />
      
      <main className="flex-1">
        <Hero
          title={settings?.hero_title}
          subtitle={settings?.hero_subtitle}
          imageUrl={settings?.hero_image_url}
        />
        <About
          title={settings?.about_title}
          text={settings?.about_text}
          imageUrl={settings?.about_image_url}
        />
        <Products spices={settings?.products_data} />
        <WhatWeDo />
        <WhyChooseUs />
        <Certifications />
        <Gallery />
        <Contact />
      </main>

      <Footer />

      {/* Floating Sticky WhatsApp Button */}
      <a
        href="https://wa.me/918128853311"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </a>
    </div>
  );
}



