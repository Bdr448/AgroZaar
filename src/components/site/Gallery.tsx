import turmericImg from "@/assets/product-turmeric.jpg";
import chilliImg from "@/assets/product-chilli.jpg";
import cuminImg from "@/assets/product-cumin.jpg";
import manufacturingImg from "@/assets/manufacturing.jpg";

export function Gallery() {
  const images = [
    {
      img: manufacturingImg,
      title: "Processing Facility",
      desc: "Fully hygienic, high-capacity cool-grinding milling plant in Gandhinagar, Gujarat.",
    },
    {
      img: turmericImg,
      title: "Premium Spice Sorting",
      desc: "Sortex cleaned turmeric roots sorted and readied for processing.",
    },
    {
      img: cuminImg,
      title: "Warehouse & Clean Storage",
      desc: "Clean, temperature-regulated raw commodity storage bins in Unjha.",
    },
    {
      img: chilliImg,
      title: "Double-Walled Export Cargo",
      desc: "Moisture-controlled spice bags loaded for international maritime shipments.",
    },
  ];

  return (
    <section id="gallery" className="py-16 md:py-24 bg-[#0a1520] text-white">
      <div className="container-x">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
            Operations Gallery
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
            Our Infrastructure & Logistics
          </h2>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            Take a visual tour through our production, sorting, warehousing, and export shipment processes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden shadow-lg h-72 group border border-white/10"
            >
              <img
                src={item.img}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-left opacity-90 group-hover:opacity-100 transition-opacity">
                <h3 className="text-lg font-bold text-white mb-1 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-white/80 text-xs leading-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
