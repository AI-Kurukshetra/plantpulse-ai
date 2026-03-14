import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type { AlertSeverity, EquipmentStatus, MaintenanceStatus, UserRole } from '@/types';

type IntegrationStatus = 'connected' | 'degraded' | 'offline' | 'planned';

type StateBadgeValue = AlertSeverity | EquipmentStatus | MaintenanceStatus | UserRole | IntegrationStatus;

const stateStyles: Record<StateBadgeValue, string> = {
  admin: 'border-amber/30 bg-amber/12 text-amber',
  plant_manager: 'border-sky-400/30 bg-sky-400/12 text-sky-200',
  technician: 'border-white/10 bg-white/6 text-mist/86',
  critical: 'border-danger/35 bg-danger/12 text-danger',
  warning: 'border-amber/35 bg-amber/12 text-amber',
  info: 'border-sky-400/30 bg-sky-400/12 text-sky-200',
  running: 'border-signal/30 bg-signal/12 text-signal',
  idle: 'border-white/10 bg-white/6 text-mist/82',
  maintenance: 'border-amber/35 bg-amber/12 text-amber',
  offline: 'border-danger/30 bg-danger/10 text-danger',
  scheduled: 'border-white/10 bg-white/6 text-mist/82',
  in_progress: 'border-signal/30 bg-signal/12 text-signal',
  completed: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
  overdue: 'border-danger/35 bg-danger/12 text-danger',
  connected: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
  degraded: 'border-amber/35 bg-amber/12 text-amber',
  planned: 'border-sky-400/30 bg-sky-400/12 text-sky-200'
};

function formatStateLabel(value: StateBadgeValue) {
  return value.replaceAll('_', ' ');
}

interface StateBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  value: StateBadgeValue;
  label?: string;
}

export function StateBadge({ className, value, label, ...props }: StateBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]',
        stateStyles[value],
        className
      )}
      {...props}
    >
      {label ?? formatStateLabel(value)}
    </span>
  );
}
