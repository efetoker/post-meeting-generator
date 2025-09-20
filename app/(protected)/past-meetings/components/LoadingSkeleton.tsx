// app/(protected)/past-meetings/components/LoadingSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-1/3" />
          <div className="mt-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
