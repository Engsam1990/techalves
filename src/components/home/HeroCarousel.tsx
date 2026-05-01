import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumProducts } from "@/api/hooks";
import { formatPrice } from "@/data/products";
import { stripHtml, truncateText } from "@/lib/seo";

const categoryLabels: Record<string, string> = {
  laptops: "Laptops",
  desktops: "Computers & Desktops",
  phones: "Phones & Tablets",
  office: "Office Equipment",
  cameras: "Cameras",
};

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, true>>({});
  const { data: premiumResponse } = usePremiumProducts(6);

  const slides = useMemo(() => {
    return (premiumResponse?.data || [])
      .filter((product) => product.images?.[0])
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        title: product.name,
        subtitle:
          truncateText(stripHtml(product.description || ""), 120) ||
          [product.brand, categoryLabels[product.category] || product.category, product.warranty].filter(Boolean).join(" • "),
        cta: "Order Now",
        link: `/product/${product.slug}`,
        image: product.images[0],
        priceLabel: formatPrice(product.price),
      }));
  }, [premiumResponse]);

  useEffect(() => {
    if (!slides.length) return;
    let cancelled = false;

    slides.forEach((slide) => {
      if (loadedImages[slide.image]) return;
      preloadImage(slide.image).then(() => {
        if (cancelled) return;
        setLoadedImages((prev) => (prev[slide.image] ? prev : { ...prev, [slide.image]: true }));
      });
    });

    return () => {
      cancelled = true;
    };
  }, [slides, loadedImages]);

  useEffect(() => {
    if (slides.length < 2 || isPaused) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  useEffect(() => {
    setCurrent((prev) => (prev >= slides.length ? 0 : prev));
  }, [slides.length]);

  if (!slides.length) return null;

  const activeIndex = slides[current] ? current : 0;
  const slide = slides[activeIndex];
  const goToPrevious = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <section
      className="relative h-[420px] overflow-hidden bg-[#0090e7] sm:h-[500px] lg:h-[560px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <div
            className={`absolute inset-0 bg-[#03111f] bg-cover bg-center transition-opacity duration-700 ${loadedImages[slide.image] ? "opacity-100" : "opacity-0"}`}
            style={loadedImages[slide.image] ? { backgroundImage: `url(${slide.image})` } : undefined}
          />
          <div className="absolute inset-0 bg-[#03111f]/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03111f]/90 via-[#03111f]/55 to-[#0090e7]/45" />
        </motion.div>
      </AnimatePresence>

      <div className="relative container flex h-full items-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl space-y-5 drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]"
          >
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-normal text-white/90 backdrop-blur-sm">
              Premium Products
            </div>

            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {slide.title}
            </h1>

            <p className="text-lg font-medium text-white/95">
              {slide.subtitle}
            </p>

            {slide.priceLabel && (
              <p className="text-xl font-bold text-[#FEEF00] sm:text-2xl">{slide.priceLabel}</p>
            )}

            <Link to={slide.link}>
              <Button
                size="lg"
                variant="secondary"
                className="mt-2 border-0 bg-[#FEEF00] text-base font-semibold text-[#030303] hover:bg-[#FEEF00]/90"
              >
                {slide.cta}
              </Button>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 right-6 flex gap-2">
        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous hero slide"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-[#FEEF00] hover:text-[#030303]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next hero slide"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-[#FEEF00] hover:text-[#030303]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Show hero slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === activeIndex ? "w-8 bg-[#FEEF00]" : "w-2 bg-white/45"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
