import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';

interface AuthPageShellProps {
  form: ReactNode;
  title: string;
  description: string;
  mode: 'login' | 'signup';
}

export function AuthPageShell({ form, title, description, mode }: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,194,138,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(243,167,18,0.08),transparent_20%)]" />
      {/* Login/signup are intentional constrained exceptions to the full-width app shell. */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[#09131d]/72 px-4 py-3 backdrop-blur-md">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <AppLogo compact />
            <span className="text-sm uppercase tracking-[0.28em] text-mist/62">PlantPulse AI</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-mist/82 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to landing
            </Link>
            <Link
              href={mode === 'login' ? '/auth/signup' : '/auth/login'}
              className="inline-flex items-center gap-2 rounded-full border border-signal/35 bg-signal/10 px-4 py-2 text-sm text-signal transition hover:bg-signal/18 hover:text-[#4ad7aa]"
            >
              {mode === 'login' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {mode === 'login' ? 'Create account' : 'Go to login'}
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 pb-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <AppLogo />
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
              <p className="mt-6 text-lg leading-8 text-mist/74">{description}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-mist/50">Operations</p>
                  <p className="mt-3 text-xl font-medium text-white">
                    Real-time plant monitoring, alerts, and performance visibility.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-mist/50">Sustainability</p>
                  <p className="mt-3 text-xl font-medium text-white">
                    Energy, emissions, and reliability insights in one decision layer.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-md items-center">
            {form}
          </section>
        </div>
      </div>
    </main>
  );
}
