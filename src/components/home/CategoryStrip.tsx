import { Link } from "react-router-dom";
import { useCategories } from "@/api/hooks";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryStripSkeleton } from "@/components/skeletons/CategorySkeleton";

const CategoryStrip = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: categories = [], isLoading } = useCategories();

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <section className="border-b bg-card">
      <div className="container relative py-3 sm:py-4">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-md transition-colors hover:text-primary lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {isLoading ? (
          <CategoryStripSkeleton />
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-10 lg:justify-center lg:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex shrink-0 flex-col items-center gap-2 md:mx-4"
              >
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-transparent transition-colors group-hover:border-brand-yellow sm:h-20 sm:w-20">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="whitespace-nowrap text-center text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-primary sm:max-w-none sm:text-xs">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-md transition-colors hover:text-primary lg:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

export default CategoryStrip;