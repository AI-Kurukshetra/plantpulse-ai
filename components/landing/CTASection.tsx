import { Card, CardContent } from '@/components/ui/card';

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Card className="overflow-hidden border-white/12 bg-[linear-gradient(135deg,rgba(16,40,60,0.96),rgba(8,20,31,0.98))]">
        <CardContent className="relative p-8 sm:p-10 lg:p-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(28,194,138,0.24),transparent_55%)] lg:block" />
          <div className="relative max-w-3xl">
            <p className="text-sm uppercase tracking-[0.36em] text-signal">Start Now</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Start Optimizing Your Plant Operations with AI
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-mist/74">
              Explore the PlantPulse AI dashboard and show how industrial intelligence can connect plant performance,
              predictive maintenance, and sustainability optimization in one product story.
            </p>
            {/* Primary Explore Dashboard CTA is intentionally kept in the hero banner only. */}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
