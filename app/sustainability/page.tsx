import { AppShell } from '@/components/layout/AppShell';
import { SustainabilityScoringDashboard } from '@/components/sustainability/SustainabilityScoringDashboard';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getSustainabilityScoringDashboardData } from '@/services/sustainabilityService';

export const metadata = createPageMetadata(
  'Sustainability Scoring',
  'Automated sustainability scoring and industry benchmarking with AI-driven recommendations.'
);

export default async function SustainabilityPage() {
  const [role, scoringData] = await Promise.all([getCurrentRole(), getSustainabilityScoringDashboardData()]);

  return (
    <AppShell
      title="Sustainability Scoring System"
      subtitle="Automated sustainability scoring and benchmarking across production lines with AI improvement guidance."
      role={role}
    >
      <SustainabilityScoringDashboard data={scoringData} />
    </AppShell>
  );
}
