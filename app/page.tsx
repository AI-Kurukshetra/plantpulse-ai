import { LandingPage } from '@/components/landing/LandingPage';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Platform Overview',
  'PlantPulse AI is an AI-driven manufacturing analytics and sustainability engine for plant monitoring, predictive maintenance, energy optimization, and emissions intelligence.'
);

export default function HomePage() {
  return <LandingPage />;
}
