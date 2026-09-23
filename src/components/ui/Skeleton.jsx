import { cn } from '../../utils/cn.js';

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded bg-[linear-gradient(90deg,#EFEFF2_0%,#F7F7F9_50%,#EFEFF2_100%)] bg-[length:320px_100%] animate-shimmer',
        className
      )}
    />
  );
}

export function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-b-0">
      <Skeleton className="h-8 w-8 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[42%]" />
        <Skeleton className="h-3 w-[68%]" />
      </div>
      <Skeleton className="hidden h-3 w-20 sm:block" />
      <Skeleton className="hidden h-3 w-14 md:block" />
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="border-b border-line py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="mb-2 h-3.5 w-[92%]" />
      <Skeleton className="h-3.5 w-[64%]" />
    </div>
  );
}

export function ChatResponseSkeleton() {
  return (
    <div className="space-y-2.5 py-1">
      <Skeleton className="h-3.5 w-[88%]" />
      <Skeleton className="h-3.5 w-[94%]" />
      <Skeleton className="h-3.5 w-[52%]" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="rounded-lg border border-line bg-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <DocumentRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
