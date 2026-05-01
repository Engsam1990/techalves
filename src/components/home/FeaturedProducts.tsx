import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import QueryErrorState from "@/components/QueryErrorState";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { apiClient } from "@/api/client";
import type { PaginatedProductsResponse } from "@/api/hooks";
import type { Product } from "@/data/products";

const hotDealSections = [
  { slug: "laptops", title: "Laptops" },
  { slug: "desktops", title: "Computers & Desktops" },
  { slug: "phones", title: "Phones & Tablets" },
  { slug: "office", title: "Office Equipment" },
  { slug: "cameras", title: "Cameras" },
] as const;

type HotDealsRailProps = {
  title: string;
  slug: string;
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

const HotDealsRail = ({ title, slug, products, isLoading, isError, onRetry }: HotDealsRailProps) => {
  if (!isLoading && !isError && products.length < 2) return null;

  return (
    <section className="border border-border/60 bg-card/80 shadow-sm">
      <div className="px-4 ps-4 md:ps-10 py-2 flex items-center justify-between gap-4 bg-gradient-to-r from-[#030303] to-[#feef00]">
        <h3 className="text-xl font-display font-bold text-white sm:text-2xl">{title}</h3>
        <Button variant="link" className="bg-primary h-auto p-1.5 text-xs md:text-sm text-white" asChild>
          <Link to={`/category/${slug}`}>See All</Link>
        </Button>
      </div>

      {isError && <QueryErrorState message={`Failed to load ${title} hot deals`} onRetry={onRetry} compact />}

      <div className="p-4 sm:p-6">
        <Carousel opts={{ loop: products.length > 1, align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-3 sm:-ml-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="pl-3 basis-1/2 lg:basis-1/5 sm:pl-4">
                    <ProductCardSkeleton />
                  </CarouselItem>
                ))
              : products.map((product, index) => (
                  <CarouselItem key={product.id} className="pl-3 basis-1/2 lg:basis-1/5 sm:pl-4">
                    <ProductCard product={product} index={index} />
                  </CarouselItem>
                ))}
          </CarouselContent>
          {!isLoading && products.length > 1 && (
            <>
              <CarouselPrevious className="-left-6 h-10 w-10 border-0 bg-background/95 shadow-lg hover:bg-background disabled:opacity-40" />
              <CarouselNext className="-right-6 h-10 w-10 border-0 bg-background/95 shadow-lg hover:bg-background disabled:opacity-40" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

const FeaturedProducts = () => {
  const sectionQueries = useQueries({
    queries: hotDealSections.map((section) => ({
      queryKey: ["products", { category: section.slug, featured: "true", limit: 20 }],
      queryFn: () => apiClient<PaginatedProductsResponse>("/products", { params: { category: section.slug, featured: "true", limit: 20 } }),
      retry: 1,
      staleTime: 2 * 60 * 1000,
    })),
  });

  const sections = hotDealSections.map((section, index) => {
    const query = sectionQueries[index];
    return {
      ...section,
      products: query.data?.data || [],
      isLoading: query.isLoading,
      isError: query.isError,
      onRetry: () => query.refetch(),
    };
  });

  const hasVisibleSection = sections.some((section) => section.products.length >= 2);
  const isLoadingAny = sections.some((section) => section.isLoading);
  const hasAnyError = sections.some((section) => section.isError);

  if (!isLoadingAny && !hasAnyError && !hasVisibleSection) return null;

  return (
    <section className="bg-muted/40">
      <div className="space-y-6 md:space-y-8">
        {/* <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-foreground">Hot Deals</h2>
          <p className="mt-2 text-muted-foreground">Featured deals grouped by category for faster browsing.</p>
        </div> */}

        {sections.map((section) => (
          <HotDealsRail
            key={section.slug}
            title={section.title}
            slug={section.slug}
            products={section.products}
            isLoading={section.isLoading}
            isError={section.isError}
            onRetry={section.onRetry}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
