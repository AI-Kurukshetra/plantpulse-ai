'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { ArrowRight, X } from 'lucide-react';
import { StateBadge } from '@/components/common/StateBadge';
import type { Alert } from '@/types';
import { formatDateTime } from '@/utils/format';
import { useEffect } from 'react';

interface AlertsPanelProps {
  alerts: Alert[];
  compact?: boolean;
  enableSeeAllModal?: boolean;
  maxVisible?: number;
}

export function AlertsPanel({
  alerts,
  compact = false,
  enableSeeAllModal = false,
  maxVisible = compact ? 3 : alerts.length
}: AlertsPanelProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const visibleAlerts = alerts.slice(0, maxVisible);

  useEffect(() => {
    if (!showAllModal) {
      return;
    }

    // Open modal from the top viewport position even after deep page scrolling.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showAllModal]);

  return (
    <>
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-5 flex items-end justify-between gap-1">
          <div>
            <p className="text-lg font-medium text-white">Alerts Panel</p>
            <p className="mt-1 text-sm text-mist/65">
              Threshold-driven operational alerts across maintenance, energy, and asset performance.
            </p>
          </div>
          {enableSeeAllModal && alerts.length > maxVisible ? (
            // See-all modal keeps inline alert stack compact and aligned with chart height on dashboard.
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-mist/70 transition hover:bg-white/10 hover:text-white"
              onClick={() => setShowAllModal(true)}
            >
              See All
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className={clsx('space-y-3', compact && 'max-h-[20rem] overflow-hidden')}>
          {!alerts.length ? (
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium text-white">No active alerts</p>
              <p className="mt-2 text-sm text-mist/75">
                Supabase is configured, but this plant currently has no open alerts in the selected window.
              </p>
            </article>
          ) : null}
          {visibleAlerts.map((alert) => (
            <article key={alert.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={clsx('font-medium text-white', compact && 'max-w-[14rem] truncate')} title={alert.title}>
                    {alert.title}
                  </p>
                  <p
                    className={clsx('mt-2 text-sm text-mist/75', compact && 'max-w-[14rem] truncate')}
                    title={alert.description}
                  >
                    {alert.description}
                  </p>
                  {alert.aiSummary ? <p className="mt-2 text-sm text-signal">AI: {alert.aiSummary}</p> : null}
                  {alert.recommendedAction ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-amber">Action: {alert.recommendedAction}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StateBadge value={alert.severity} className="whitespace-nowrap" />
                  {alert.generatedByAI ? (
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-signal">
                      AI
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-xs text-mist/50">
                Raised {formatDateTime(alert.createdAt)}
                {alert.source ? ` • ${alert.source.replaceAll('_', ' ')}` : ''}
              </p>
            </article>
          ))}
        </div>
      </section>

      {showAllModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#050d15]/75 p-4 pt-6 backdrop-blur-sm sm:pt-10">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0b1622] p-5 shadow-panel md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">All Alerts</h2>
              <button
                type="button"
                aria-label="Close all alerts modal"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist/75 transition hover:bg-white/5 hover:text-white"
                onClick={() => setShowAllModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <article key={alert.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-white">{alert.title}</p>
                    <StateBadge value={alert.severity} className="shrink-0" />
                  </div>
                  <p className="mt-2 text-sm text-mist/75">{alert.description}</p>
                  {alert.aiSummary ? <p className="mt-2 text-sm text-signal">AI: {alert.aiSummary}</p> : null}
                  {alert.recommendedAction ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-amber">Action: {alert.recommendedAction}</p>
                  ) : null}
                  <p className="mt-3 text-xs text-mist/50">
                    Raised {formatDateTime(alert.createdAt)}
                    {alert.source ? ` • ${alert.source.replaceAll('_', ' ')}` : ''}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
