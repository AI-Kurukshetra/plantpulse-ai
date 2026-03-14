import { LoaderCircle } from 'lucide-react';

/** Shown while auth page (login/signup) is loading (e.g. getCurrentUser). */
export default function AuthLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <LoaderCircle className="h-10 w-10 animate-spin text-signal" aria-hidden />
      <p className="text-sm text-mist/75">Loading…</p>
    </div>
  );
}
