import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/landing/SectionHeading';

export interface FeatureItem {
  title: string;
  description: string;
  eyebrow?: string;
}

interface FeatureSectionProps {
  badge: string;
  title: string;
  description: string;
  items: FeatureItem[];
  columns?: 'two' | 'three' | 'four';
}

const gridClassMap = {
  two: 'md:grid-cols-2',
  three: 'md:grid-cols-2 xl:grid-cols-3',
  four: 'sm:grid-cols-2 xl:grid-cols-4'
};

export function FeatureSection({
  badge,
  title,
  description,
  items,
  columns = 'four'
}: FeatureSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading badge={badge} title={title} description={description} />
      <div className={`mt-10 grid gap-4 ${gridClassMap[columns]}`}>
        {items.map((item) => (
          <Card key={item.title} className="h-full bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/16">
            <CardHeader>
              {item.eyebrow ? (
                <p className="text-xs uppercase tracking-[0.3em] text-signal">{item.eyebrow}</p>
              ) : null}
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
