import { Skeleton } from '@/components/common/Skeleton';

/**
 * Content-area skeleton shown inside the dashboard layout while the page segment is loading.
 * Sidebar and header remain visible; only this block appears in the main content area.
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-64 xl:col-span-2" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
