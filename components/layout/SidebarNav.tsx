'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import type { Route } from 'next';
import type { UserRole } from '@/types';

export interface NavItem {
  href: Route;
  label: string;
  roles: UserRole[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Admin: Settings,
  'Real-time Monitoring': Gauge,
  Plants: Factory,
  'Equipment Health': Wrench,
  'Production Efficiency': Activity,
  'Predictive Maintenance': Wrench,
  'Anomaly Detection': BellRing,
  Sustainability: Leaf,
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

interface SidebarNavProps {
  /** Role-filtered nav items (computed by AppShell from lib/navigation). */
  items: NavItem[];
}

/**
 * Client sidebar nav: highlights the current page using usePathname().
 * Active item gets distinct border/background so the current page is clear.
 */
export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-10 space-y-2" aria-label="Main navigation">
      {items.map((item) => {
        const Icon = iconMap[item.label] ?? Activity;
        const isActive = pathname === item.href;

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition hover:border-white/10 hover:bg-white/5 hover:text-white ${
              isActive
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-transparent text-mist/75'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
