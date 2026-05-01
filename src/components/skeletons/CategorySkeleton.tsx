import { Skeleton } from "@/components/ui/skeleton";

export const CategoryGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-xl border">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);

export const CategoryStripSkeleton = () => (
  <div className="flex gap-4 justify-center px-6 lg:px-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-2 shrink-0">
        <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
    ))}
  </div>
);
