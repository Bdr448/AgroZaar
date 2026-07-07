import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-turmeric.jpg";
import manufacturingImg from "@/assets/manufacturing.jpg";
import cuminImg from "@/assets/product-cumin.jpg";

interface HeroProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export function Hero({ title, subtitle, imageUrl }: HeroProps) {
  const slides = [
    {
      title: title || "Welcome to Agrozaar Foods LLP",
      subtitle: subtitle || "Connecting wholesale global buyers with India's finest ground spices under flagship brand Aviraaj.",
      img: imageUrl || heroImg,
      align: "center",
      btnText: "Connect With Us",
      btnHref: "#contact",
      isVideo: true,
    },
    {
      title: "Premium Spice Processing & Purity",
      subtitle: "Processed using advanced Volatile Oil Retention (VOR) cool-grinding technology to preserve natural aroma and oils.",
      img: manufacturingImg,
      align: "left",
      btnText: "Explore Our Products",
      btnHref: "#products",
    },
    {
      title: "100% Certified Export Grade",
      subtitle: "Rigorous quality compliance, moisture control, and double-walled packaging designed for international sea cargo.",
      img: cuminImg,
      align: "right",
      btnText: "Request B2B Quote",
      btnHref: "#contact",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section id="top" className="relative h-[480px] md:h-[600px] lg:h-[680px] w-full overflow-hidden bg-black">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {slide.isVideo ? (
            <video
              src="/hero-bg-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover brightness-[0.5] scale-100 transition-transform duration-[5000ms]"
            />

          ) : (
            <img
              src={slide.img}
              alt={slide.title}
              className="h-full w-full object-cover brightness-[0.6] scale-100 transition-transform duration-[5000ms]"
            />
          )}
          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`container-x w-full text-white px-4 md:px-8 text-center md:max-w-4xl ${
                slide.align === "left"
                  ? "md:text-left md:mr-auto"
                  : slide.align === "right"
                  ? "md:text-right md:ml-auto"
                  : "text-center mx-auto"
              }`}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-md animate-slide-up text-balance">
                {slide.title}
              </h1>
              <p className="text-sm md:text-lg lg:text-xl mb-6 md:mb-10 text-white/90 font-medium leading-relaxed max-w-2xl drop-shadow-sm inline-block text-pretty">
                {slide.subtitle}
              </p>
              <div>
                <a
                  href={slide.btnHref}
                  className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#0a1520] font-bold py-3 px-8 rounded-md text-sm md:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/45 group btn-shine"
                >
                  {slide.btnText}
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Nav Chevrons */}
      <button
        aria-label="Previous slide"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-sm p-2 md:p-3 rounded-full text-white transition-all border border-white/20 hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        aria-label="Next slide"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-sm p-2 md:p-3 rounded-full text-white transition-all border border-white/20 hover:scale-105"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-[#d4af37] scale-125 shadow-md"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

