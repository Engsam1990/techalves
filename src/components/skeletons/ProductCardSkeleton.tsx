import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  viewMode?: "grid" | "list";
}

const ProductCardSkeleton = ({ viewMode = "grid" }: Props) => (
  <div className={`rounded-xl border bg-card overflow-hidden ${viewMode === "list" ? "flex" : ""}`}>
    <Skeleton className={`${viewMode === "list" ? "w-48 shrink-0 h-36" : "aspect-[4/3] w-full"}`} />
    <div className="p-4 space-y-2 flex-1">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
    <div className="px-4 pb-4 flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-md" />
    </div>
  </div>
);

export default ProductCardSkeleton;
