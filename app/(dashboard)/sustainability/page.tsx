import { SustainabilityScoringDashboard } from '@/components/sustainability/SustainabilityScoringDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getSustainabilityScoringDashboardData } from '@/services/sustainabilityService';

export const metadata = createPageMetadata(
  'Sustainability Scoring',
  'Automated sustainability scoring and industry benchmarking with AI-driven recommendations.'
);

export default async function SustainabilityPage() {
  const scoringData = await getSustainabilityScoringDashboardData();

  return <SustainabilityScoringDashboard data={scoringData} />;
}
