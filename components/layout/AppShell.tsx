import Link from 'next/link';
import {
  Activity,
  BellRing,
  ClipboardCheck,
  Droplets,
  Factory,
  Gauge,
  History,
  Leaf,
  LineChart,
  PlugZap,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Smartphone,
  TestTubeDiagonal,
  Users,
  Wrench
} from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';
import { navigation } from '@/lib/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';
import type { UserRole } from '@/types';

const iconMap = {
  'Control Center': Settings,
  'Real-time Monitoring': Gauge,
  Plants: Factory,
  'Equipment Health': Wrench,
  'Energy Consumption': Activity,
  'Production Efficiency': Activity,
  'Predictive Maintenance': Wrench,
  'Anomaly Detection': BellRing,
  'Emissions Tracking': Leaf,
  'Sustainability Scoring': Leaf,
  'Multi-site Fleet': Factory,
  'Cost Optimization': ReceiptText,
  'Regulatory Compliance': ClipboardCheck,
  'Resource Utilization': Activity,
  'Alert Management': BellRing,
  'Historical Analysis': History,
  'Mobile Operations': Smartphone,
  'Custom Reports': LineChart,
  'Data Export / Import': PlugZap,
  'Benchmark Comparison': Scale,
  'Waste Analytics': TestTubeDiagonal,
  'Water Optimization': Droplets,
  'Integration API Gateway': PlugZap,
  'Role-based Access Control': ShieldCheck,
  Users
};

interface AppShellProps {
  title: string;
  subtitle: string;
  role?: UserRole;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, role = 'plant_manager', fullWidth = true, children }: AppShellProps) {
  // Role-filtered navigation keeps admin-only links invisible to non-admin users.
  const allowedNavigation = navigation.filter((item) => item.roles.includes(role));
  const shellWidthClass = fullWidth ? 'max-w-none px-0' : 'max-w-7xl px-4 lg:px-8';

  return (
    <div className="min-h-screen grid-overlay bg-plant-grid">
      {/* App shell is full-width by default; landing/auth use separate constrained layouts. */}
      <div className={`mx-auto flex min-h-screen w-full gap-6 py-6 ${shellWidthClass}`}>
        {/* Sticky sidebar keeps navigation visible while scrolling long analytics pages. */}
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:flex-col lg:overflow-y-auto">
          <div>
            {/* Shared SVG logo component keeps branding consistent across app surfaces. */}
            <AppLogo />
            <p className="mt-2 text-sm text-mist/70">
              Smart plant intelligence for operations, equipment health, energy, and emissions oversight.
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {allowedNavigation.map((item) => {
              const Icon = iconMap[item.label as keyof typeof iconMap];
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-mist/75 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 rounded-[30px] border border-white/10 bg-slate/60 p-5 shadow-panel backdrop-blur md:p-8">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <AppLogo compact className="mb-3 md:hidden" />
              <p className="text-xs uppercase tracking-[0.35em] text-signal">Live plant intelligence</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-mist/75">{subtitle}</p>
            </div>

            {/* Grouped shift box + sign out keeps header actions aligned across breakpoints. */}
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-mist/55">Plant window</p>
                <p className="mt-1 text-lg font-medium text-white">Shift A / 06:00 - 14:00</p>
              </div>
              <div className="md:self-stretch">
                <SignOutButton />
              </div>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
