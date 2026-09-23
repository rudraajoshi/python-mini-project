import { Skeleton } from '../ui/Skeleton.jsx';

export default function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Skeleton className="mb-3 h-6 w-48" />
      <Skeleton className="mb-8 h-3.5 w-72" />
      <div className="space-y-2.5">
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
