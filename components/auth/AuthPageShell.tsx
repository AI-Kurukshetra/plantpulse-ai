import type { ReactNode } from 'react';
import { AppLogo } from '@/components/common/AppLogo';

interface AuthPageShellProps {
  form: ReactNode;
  title: string;
  description: string;
}

export function AuthPageShell({ form, title, description }: AuthPageShellProps) {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,194,138,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(243,167,18,0.08),transparent_20%)]" />
      {/* Login/signup are intentional constrained exceptions to the full-width app shell. */}
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <AppLogo />
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
            <p className="mt-6 text-lg leading-8 text-mist/74">{description}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-mist/50">Operations</p>
                <p className="mt-3 text-xl font-medium text-white">Real-time plant monitoring, alerts, and performance visibility.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-mist/50">Sustainability</p>
                <p className="mt-3 text-xl font-medium text-white">Energy, emissions, and reliability insights in one decision layer.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md items-center">
          {form}
        </section>
      </div>
    </main>
  );
}
