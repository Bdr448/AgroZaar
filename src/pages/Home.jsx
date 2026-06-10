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
