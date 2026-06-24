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
  const [activeTab, setActiveTab] = useState<"about" | "products" | "export">("about");

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
      if (["about", "products", "export"].includes(id)) {
        setActiveTab(id as any);
        const scrollToElement = () => {
          const el = document.getElementById("main-content-tabs");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        };
        
        scrollToElement();
        const t1 = setTimeout(scrollToElement, 100);
        const t2 = setTimeout(scrollToElement, 400);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      } else {
        const scrollToElement = () => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        };
        
        scrollToElement();
        const t1 = setTimeout(scrollToElement, 100);
        const t2 = setTimeout(scrollToElement, 400);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
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
          const id = href.substring(1);
          if (["about", "products", "export"].includes(id)) {
            e.preventDefault();
            setActiveTab(id as any);
            const el = document.getElementById("main-content-tabs");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
            window.history.pushState(null, "", href);
          } else {
            e.preventDefault();
            const el = document.getElementById(id);
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
              window.history.pushState(null, "", href);
            }
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

        {/* Tab Switcher section */}
        <div className="border-b border-border bg-card sticky top-[64px] z-30 shadow-sm transition-all duration-300">
          <div className="container-x flex justify-center gap-6 md:gap-10 py-3">
            {[
              { id: "about", label: "Our Story" },
              { id: "products", label: "Aviraaj Spices" },
              { id: "export", label: "Global Export" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  const el = document.getElementById("main-content-tabs");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                  window.history.pushState(null, "", `#${tab.id}`);
                }}
                className={`pb-2.5 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div id="main-content-tabs" className="transition-all duration-300">
          {activeTab === "about" && (
            <About
              title={settings?.about_title}
              text={settings?.about_text}
              imageUrl={settings?.about_image_url}
            />
          )}
          {activeTab === "products" && <Products spices={settings?.products_data} />}
          {activeTab === "export" && <Export countries={settings?.export_countries} />}
        </div>

        <Contact />
      </main>
      <Footer />
    </div>
  );
}
