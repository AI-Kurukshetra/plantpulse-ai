'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate/60 p-8 shadow-panel backdrop-blur">
        <p className="text-xs uppercase tracking-[0.4em] text-danger">System recovery</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">PlantPulse AI hit an unexpected error.</h1>
        <p className="mt-3 text-sm text-mist/75">{error.message || 'Please retry the request.'}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-2xl bg-signal px-5 py-3 font-medium text-ink transition hover:bg-[#39d8a2]"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
