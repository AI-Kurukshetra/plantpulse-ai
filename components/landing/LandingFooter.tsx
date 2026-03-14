import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.34em] text-signal">PlantPulse AI</p>
          <p className="mt-4 text-base leading-7 text-mist/72">
            AI-powered manufacturing intelligence and sustainability optimization platform.
          </p>
        </div>
        <nav className="flex gap-6 text-sm text-mist/72">
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/auth/login" className="transition hover:text-white">
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}
