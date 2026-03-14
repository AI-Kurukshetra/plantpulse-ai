import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate/60 p-8 shadow-panel backdrop-blur">
        <p className="text-xs uppercase tracking-[0.4em] text-amber">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">This PlantPulse AI page does not exist.</h1>
        <p className="mt-3 text-sm text-mist/75">
          The requested route is unavailable or has moved. Use the dashboard entry point to continue.
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-2xl bg-signal px-5 py-3 font-medium text-ink">
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
