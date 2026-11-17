import { Skeleton } from "@/components/ui/skeleton";

export function RoleListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-white">
      <div className="divide-y divide-hairline">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-6 px-5 py-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}