import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/* Flash-sale end date — set to 3 days from now so the timer always has something to count */
const FLASH_SALE_END = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="bg-primary-foreground text-primary font-bold text-lg sm:text-2xl rounded-md w-10 sm:w-14 h-10 sm:h-14 flex items-center justify-center tabular-nums shadow-md">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] sm:text-xs text-primary-foreground/70 mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

const promos = [
  {
    id: 1,
    badge: "Flash Sale",
    icon: Flame,
    title: "Up to 50% OFF Refurbished Laptops",
    subtitle: "Grade A quality, fully tested — limited stock!",
    cta: "Shop Now",
    link: "/category/laptops",
    gradient: "from-red-600 via-orange-500 to-amber-500",
    showTimer: true,
  },
  {
    id: 2,
    badge: "New Arrivals",
    icon: Zap,
    title: "iPhone 15 Pro Now Available",
    subtitle: "Genuine Apple warranty • Free delivery in Nairobi",
    cta: "View Phones",
    link: "/category/phones",
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    showTimer: false,
  },
];

const PromoBanner = () => {
  const countdown = useCountdown(FLASH_SALE_END);

  return (
    <section className="py-6">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.gradient} p-6 sm:p-8 text-white shadow-lg`}
            >
              {/* decorative circle */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />

              <div className="relative z-10 space-y-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm gap-1">
                  <promo.icon className="h-3 w-3" />
                  {promo.badge}
                </Badge>

                <h3 className="text-xl sm:text-2xl font-display font-bold leading-tight">{promo.title}</h3>
                <p className="text-white/80 text-sm sm:text-base">{promo.subtitle}</p>

                {promo.showTimer && (
                  <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                    <Clock className="h-4 w-4 text-white/70 shrink-0" />
                    <span className="text-xs text-white/70 mr-1 hidden sm:inline">Ends in</span>
                    <TimeBox value={countdown.days} label="Days" />
                    <span className="text-white/50 font-bold text-lg">:</span>
                    <TimeBox value={countdown.hours} label="Hrs" />
                    <span className="text-white/50 font-bold text-lg">:</span>
                    <TimeBox value={countdown.minutes} label="Min" />
                    <span className="text-white/50 font-bold text-lg">:</span>
                    <TimeBox value={countdown.seconds} label="Sec" />
                  </div>
                )}

                <Link to={promo.link}>
                  <Button size="sm" className="mt-2 bg-white text-primary hover:bg-white/90 font-semibold gap-1">
                    {promo.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PromoBanner;
