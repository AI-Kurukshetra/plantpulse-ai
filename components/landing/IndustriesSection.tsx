import { Building2, Car, Factory, FlaskConical, Fuel, Sandwich } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/landing/SectionHeading';

const industries = [
  { label: 'Automotive', icon: Car },
  { label: 'Food & Beverage', icon: Sandwich },
  { label: 'Chemicals', icon: FlaskConical },
  { label: 'Energy', icon: Fuel },
  { label: 'Industrial Manufacturing', icon: Factory }
];

export function IndustriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        badge="Target Industries"
        title="Built for manufacturing environments where uptime, efficiency, and ESG performance matter"
        description="The platform is tuned for plants that need operational clarity across production assets, utility systems, and sustainability reporting."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {industries.map((industry) => {
          const Icon = industry.icon;

          return (
            <Card key={industry.label} className="bg-white/[0.04]">
              <CardContent className="flex min-h-[160px] flex-col justify-between p-6">
                <Icon className="h-8 w-8 text-signal" />
                <div>
                  <div className="text-sm uppercase tracking-[0.25em] text-mist/50">Sector</div>
                  <div className="mt-3 text-xl font-medium text-white">{industry.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-dashed border-white/12 bg-[#0d1a28]/80 sm:col-span-2 xl:col-span-5">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.28em] text-signal">Deployment fit</div>
              <div className="mt-2 text-2xl font-semibold text-white">Single-site rollout today, fleet-scale intelligence next.</div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist/72">
              <Building2 className="h-5 w-5 text-amber" />
              Multi-plant benchmarking ready
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
