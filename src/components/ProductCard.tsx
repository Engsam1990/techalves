import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Product, formatPrice } from "@/data/products";
import { stripHtml } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, CheckCircle, GitCompareArrows } from "lucide-react";
import { motion } from "framer-motion";
import { apiPost } from "@/api/client";

interface ProductCardProps {
  product: Product;
  index?: number;
  viewMode?: "grid" | "list";
  onCompare?: (product: Product) => void;
  isComparing?: boolean;
}

const ProductCard = ({ product, index = 0, viewMode = "grid", onCompare, isComparing }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // const promoBadge = useMemo(() => {
  //   const categoryText = `${product.category} ${product.subcategory || ""}`.toLowerCase();
  //   const isLaptopOrDesktop = /(laptop|desktop|computer|pc)/.test(categoryText);

  //   if (!product.featured || !isLaptopOrDesktop) return null;
  //   return product.originalPrice ? "Hot Deal" : "";
  // }, [product.category, product.featured, product.originalPrice, product.subcategory]);

  const startImageCycle = () => {
    if (product.images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 2400);
  };

  const stopImageCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const trackClick = () => {
    apiPost("/analytics/track", {
      productId: product.id,
      event: "click",
      metadata: { source: "product_card" },
    }).catch(() => {});
  };

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={`group relative flex h-full overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.16)] ${
          viewMode === "list" ? "flex-row" : "flex-col"
        }`}
      >
        <Link
          to={`/product/${product.slug}`}
          className={`flex flex-1 ${viewMode === "list" ? "flex-row" : "flex-col"}`}
          onMouseEnter={startImageCycle}
          onMouseLeave={stopImageCycle}
          onClick={trackClick}
        >
          <div className={`relative overflow-hidden bg-muted ${viewMode === "list" ? "w-48 shrink-0" : "aspect-[4/3] w-full"}`}>
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={i === 0 ? product.name : ""}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                  i === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
              />
            ))}

            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm">
                {product.images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentImageIndex ? "w-4 bg-primary" : "w-1.5 bg-primary-foreground/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {product.condition !== "new" && (
              <Badge className="absolute left-1 top-3 bg-brand-yellow capitalize text-black">
                {product.condition === "ex-uk" ? "Ex-UK" : "Refurbished"}
              </Badge>
            )}

            {product.originalPrice && (
              <Badge className="absolute right-1 top-3 bg-destructive text-destructive-foreground">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          {onCompare && (
            <Button
              variant={isComparing ? "default" : "outline"}
              size="sm"
              className="absolute bottom-3 left-1 gap-1.5 text-xs"
              onClick={(e) => {
                e.preventDefault();
                onCompare(product);
              }}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              {isComparing ? "✔" : ""}
            </Button>
          )}
            {/* {promoBadge && (
              <Badge className="absolute bottom-3 left-1 bg-brand-yellow text-secondary shadow-sm">
                {promoBadge}
              </Badge>
            )} */}
          </div>

          <div className="flex flex-1 flex-col p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>

            <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-display font-semibold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>

            {viewMode === "list" && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{stripHtml(product.description)}</p>
            )}

            <div className="mt-2 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>

            <div className="mt-3">
              <span className="text-md font-display font-bold text-primary md:text-lg">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="ml-2 text-xs text-muted-foreground line-through md:text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              <span className={product.inStock ? "text-green-600" : "text-destructive"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </Link>

        <div className="mt-auto flex gap-2 px-4 pb-2">
          {/* <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs transition-colors group-hover:border-brand-yellow group-hover:bg-brand-yellow group-hover:text-secondary"
            asChild
          >
            <Link to={`/product/${product.slug}`} onClick={trackClick}>
              <Eye className="h-3.5 w-3.5" /> View
            </Link>
          </Button> */}


        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;