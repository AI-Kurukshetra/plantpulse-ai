import { getCurrentRole } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

/**
 * Shared dashboard layout: sidebar and header always visible; only the main content area
 * is replaced by the segment (page or loading.tsx). So during loading, sidebar and header
 * stay visible and only the content shows a skeleton/loader.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  return <DashboardShell role={role}>{children}</DashboardShell>;
}
