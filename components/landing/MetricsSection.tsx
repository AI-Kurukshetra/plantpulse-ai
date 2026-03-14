import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/landing/SectionHeading';

const metrics = [
  { label: 'Overall Equipment Effectiveness (OEE)', value: '91.8%' },
  { label: 'Energy Consumption per Unit', value: '3.4 kWh' },
  { label: 'Carbon Emissions Reduction', value: '18%' },
  { label: 'Predictive Maintenance Accuracy', value: '94%' },
  { label: 'Operational Cost Savings', value: '$420K' },
  { label: 'Regulatory Compliance Score', value: '98 / 100' }
];

export function MetricsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        badge="Key Metrics Tracked"
        title="Operational and sustainability KPIs in one AI decision surface"
        description="PlantPulse AI keeps production leaders, reliability teams, and ESG stakeholders aligned around the same performance model."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-white/[0.04]">
            <CardContent className="flex items-end justify-between gap-4 p-6">
              <div>
                <p className="text-sm leading-6 text-mist/72">{metric.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
              </div>
              <Badge className="border-signal/30 bg-signal/10 text-signal">Live KPI</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
