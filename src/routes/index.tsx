import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agrozaar Foods LLP — Premium Spice Manufacturing & Export | Aviraaj" },
      { name: "description", content: "Agrozaar Foods LLP manufactures and exports premium turmeric, chilli, coriander, cumin & garam masala under the Aviraaj brand for B2B, distributors, retailers and export markets." },
      { property: "og:title", content: "Agrozaar Foods LLP — Pure Spices. Pure Trust." },
      { property: "og:description", content: "Premium quality spices for B2B, retail, distributors and export markets, crafted with modern processing and uncompromised purity." },
      { property: "og:type", content: "website" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Agrozaar Foods LLP",
          description: "Spice manufacturing and export company specializing in turmeric, chilli, coriander, cumin and garam masala under the Aviraaj brand.",
          foundingDate: "2026",
          address: { "@type": "PostalAddress", addressRegion: "Gujarat", addressCountry: "IN" },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Products />
        <WhyChooseUs />
        <BusinessCategories />
        <Export />
        <ManufacturingProcess />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
