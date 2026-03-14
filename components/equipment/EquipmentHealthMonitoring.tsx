'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Gauge, Wrench } from 'lucide-react';
import { EquipmentStatusTable } from '@/components/dashboard/EquipmentStatusTable';
import type { Alert, Equipment } from '@/types';
import { formatCompactNumber } from '@/utils/format';

interface EquipmentHealthMonitoringProps {
  initialAlerts: Alert[];
  initialEquipment: Equipment[];
}

type EquipmentHealthPayload = {
  alerts: Alert[];
  equipment: Equipment[];
};

export function EquipmentHealthMonitoring({ initialAlerts, initialEquipment }: EquipmentHealthMonitoringProps) {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/equipment-health', { cache: 'no-store' });
        const payload = (await response.json()) as EquipmentHealthPayload;

        if (!response.ok) {
          throw new Error('Unable to refresh equipment health data.');
        }

        setEquipment(payload.equipment);
        setAlerts(payload.alerts);
        setRefreshError(null);
      } catch {
        setRefreshError('Live update temporarily unavailable. Showing latest captured data.');
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const runningCount = useMemo(() => equipment.filter((item) => item.status === 'running').length, [equipment]);
  const faultCount = useMemo(
    () => equipment.filter((item) => item.status === 'maintenance' || item.status === 'offline').length,
    [equipment]
  );
  const averageHealth = useMemo(
    () =>
      equipment.length
        ? Number((equipment.reduce((sum, item) => sum + item.healthScore, 0) / equipment.length).toFixed(1))
        : 0,
    [equipment]
  );
  const aiAssistedCount = useMemo(() => equipment.filter((item) => Boolean(item.aiInsight)).length, [equipment]);
  const activeAlerts = useMemo(() => alerts.filter((alert) => !alert.acknowledged).length, [alerts]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Assets Running</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <Activity className="h-5 w-5 text-signal" />
            {runningCount}
          </p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Fault Status</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <AlertTriangle className="h-5 w-5 text-danger" />
            {faultCount}
          </p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Average Health</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <Gauge className="h-5 w-5 text-amber" />
            {averageHealth}%
          </p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">Open Alerts</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCompactNumber(activeAlerts)}</p>
        </article>
        <article className="rounded-[22px] border border-white/10 bg-ink/50 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-mist/60">AI-Assisted Assets</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <Wrench className="h-5 w-5 text-signal" />
            {aiAssistedCount}
          </p>
        </article>
      </section>

      {refreshError ? <p className="text-xs text-amber">{refreshError}</p> : null}

      <EquipmentStatusTable equipment={equipment} showControls />
    </div>
  );
}
