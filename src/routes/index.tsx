import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { Export } from "@/components/site/Export";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agrozaar Foods LLP — Premium Spice Manufacturing & Export | Aviraaj" },
      {
        name: "description",
        content:
          "Agrozaar Foods LLP manufactures and exports premium turmeric, chilli, coriander, cumin & garam masala under the Aviraaj brand for B2B, distributors, retailers and export markets.",
      },
      { property: "og:title", content: "Agrozaar Foods LLP — Pure Spices. Pure Trust." },
      {
        property: "og:description",
        content:
          "Premium quality spices for B2B, retail, distributors and export markets, crafted with modern processing and uncompromised purity.",
      },
      { property: "og:type", content: "website" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Agrozaar Foods LLP",
          description:
            "Spice manufacturing and export company specializing in turmeric, chilli, coriander, cumin and garam masala under the Aviraaj brand.",
          foundingDate: "2026",
          address: { "@type": "PostalAddress", addressRegion: "Gujarat", addressCountry: "IN" },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [settings, setSettings] = useState<any>(null);

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
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const scrollToElement = () => {
        const el = document.getElementById(id);
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
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          e.preventDefault();
          const id = href.substring(1);
          const el = document.getElementById(id);
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
        <Export countries={settings?.export_countries} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
