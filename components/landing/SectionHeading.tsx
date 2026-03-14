import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

interface SectionHeadingProps {
  badge: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}

export function SectionHeading({
  badge,
  title,
  description,
  align = 'left',
  action
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <Badge className={centered ? 'mx-auto' : undefined}>{badge}</Badge>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-mist/72 sm:text-lg">{description}</p>
      {action ? <div className={centered ? 'mt-6 flex justify-center' : 'mt-6'}>{action}</div> : null}
    </div>
  );
}
