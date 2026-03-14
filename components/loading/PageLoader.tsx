import { LoaderCircle } from 'lucide-react';

/**
 * Full-segment loader for route loading.tsx: shown while page data is being fetched (Supabase or server).
 * Keeps styling aligned with app (signal accent, dark background) so transitions feel consistent.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-[30px] border border-white/10 bg-slate/60 p-8">
      <LoaderCircle className="h-10 w-10 animate-spin text-signal" aria-hidden />
      <p className="text-sm text-mist/75">Loading…</p>
    </div>
  );
}
