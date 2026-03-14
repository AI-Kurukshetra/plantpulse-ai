import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/landing/SectionHeading';

const steps = [
  {
    step: '01',
    title: 'Connect industrial sensors and equipment',
    description:
      'Integrate PLCs, SCADA signals, historian feeds, and IoT devices into a unified data layer for the plant.'
  },
  {
    step: '02',
    title: 'Collect and analyze operational data with AI',
    description:
      'Normalize production, maintenance, energy, and emissions data to detect performance drift and operational anomalies.'
  },
  {
    step: '03',
    title: 'Optimize plant performance and sustainability metrics',
    description:
      'Turn AI recommendations into measurable gains in uptime, throughput, energy intensity, and environmental compliance.'
  }
];

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        badge="How It Works"
        title="From raw plant signals to AI-guided operational gains"
        description="PlantPulse AI closes the loop between sensor telemetry, manufacturing analytics, and sustainability performance."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
        {steps.map((item, index) => (
          <div key={item.step} className="contents">
            <Card className="bg-white/[0.04]">
              <CardHeader>
                <div className="text-sm font-medium uppercase tracking-[0.34em] text-signal">{item.step}</div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-mist/72">{item.description}</CardContent>
            </Card>
            {index < steps.length - 1 ? (
              <div className="hidden justify-center lg:flex">
                <ArrowRight className="h-6 w-6 text-white/30" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
