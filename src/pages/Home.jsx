import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { BusinessCategories } from "@/components/site/BusinessCategories";
import { Export } from "@/components/site/Export";
import { ManufacturingProcess } from "@/components/site/ManufacturingProcess";
import { Testimonials } from "@/components/site/Testimonials";
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

  // Realign scroll position to match URL hash to prevent layout shift misalignment after settings load
  useEffect(() => {
    const getHashId = () => {
      const hash = window.location.hash;
      if (!hash) return null;
      // In hash-based routing, clean up the hash prefix (# or #/)
      const cleanHash = hash.replace(/^#\/?/, "");
      // If it is an ERP page route rather than a landing page anchor, skip it
      if (cleanHash === "login" || cleanHash.startsWith("app") || cleanHash === "unauthorized" || cleanHash.startsWith("forgot") || cleanHash.startsWith("reset")) {
        return null;
      }
      return cleanHash;
    };

    const targetId = getHashId();
    if (targetId) {
      const scrollToElement = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };
      
      scrollToElement();
      const t1 = setTimeout(scrollToElement, 100);
      const t2 = setTimeout(scrollToElement, 400);
      const t3 = setTimeout(scrollToElement, 800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
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
          // Skip if it is an ERP page route (like #/login or #/app/billing)
          if (cleanId === "login" || cleanId.startsWith("app") || cleanId === "unauthorized" || cleanId.startsWith("forgot") || cleanId.startsWith("reset")) {
            return;
          }
          e.preventDefault();
          const el = document.getElementById(cleanId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
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
        <WhyChooseUs />
        <BusinessCategories />
        <Export countries={settings?.export_countries} />
        <ManufacturingProcess />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
