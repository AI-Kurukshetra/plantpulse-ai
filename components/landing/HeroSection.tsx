import Link from 'next/link';
import { ArrowRight, Bot, Factory, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DashboardPreview } from '@/components/landing/DashboardPreview';

const heroSignals = [
  'AI maintenance intelligence',
  'Energy and emissions visibility',
  'Operational anomaly detection'
];

interface HeroSectionProps {
  dashboardHref: '/dashboard' | '/auth/login';
}

export function HeroSection({ dashboardHref }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(28,194,138,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(243,167,18,0.14),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div className="flex flex-col justify-center">
          <Badge>Smart Plant Intelligence Platform</Badge>
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.36em] text-signal">
            AI-Driven Manufacturing Analytics & Sustainability Engine
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl xl:text-7xl">
            PlantPulse AI
            <span className="block text-mist">for resilient, efficient, lower-carbon plants.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/75">
            A next-generation industrial intelligence platform that combines AI, IoT sensor analytics, and
            sustainability monitoring to optimize plant operations, prevent equipment failures, and reduce
            environmental impact.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              // CTA logic: send unauthenticated users to login before dashboard.
              href={dashboardHref}
              aria-label="Explore the PlantPulse AI dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-signal px-5 py-3 font-medium text-ink transition hover:bg-[#4ad7aa]"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {heroSignals.map((signal, index) => (
              <div key={signal} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  {index === 0 ? (
                    <Bot className="h-5 w-5 text-signal" />
                  ) : index === 1 ? (
                    <ShieldCheck className="h-5 w-5 text-amber" />
                  ) : (
                    <Factory className="h-5 w-5 text-mist" />
                  )}
                  <span className="text-sm text-mist/78">{signal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cap preview width/height so hero media looks like a realistic product screenshot, not a full-page block. */}
        <div className="mx-auto w-full max-w-[860px] lg:pt-6">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
