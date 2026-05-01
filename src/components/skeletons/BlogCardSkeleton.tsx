import { Skeleton } from "@/components/ui/skeleton";

const BlogCardSkeleton = () => (
  <div className="rounded-xl border bg-card overflow-hidden">
    <Skeleton className="aspect-[16/9] w-full" />
    <div className="p-6 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export default BlogCardSkeleton;
