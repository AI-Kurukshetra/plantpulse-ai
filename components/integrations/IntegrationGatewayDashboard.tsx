'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Link2 } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '@/components/common/Button';
import { StateBadge } from '@/components/common/StateBadge';
import type { IntegrationGatewayDashboardData } from '@/types';
import { formatDateTime } from '@/utils/format';

const PAGE_SIZE = 6;

export function IntegrationGatewayDashboard({ data }: { data: IntegrationGatewayDashboardData }) {
  const [site, setSite] = useState<'all' | string>('all');
  const [system, setSystem] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredConnectors = useMemo(
    () =>
      data.connectors.filter((item) => {
        const bySite = site === 'all' || item.site === site;
        const bySystem = system === 'all' || item.systemType === system;
        return bySite && bySystem;
      }),
    [data.connectors, site, system]
  );

  const totalPages = Math.max(1, Math.ceil(filteredConnectors.length / PAGE_SIZE));
  const pageItems = filteredConnectors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFilterChange = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-lg font-medium text-white">Integration API Gateway</p>
            <p className="mt-1 text-sm text-mist/65">
              ERP, MES, SCADA, and historian integration health with gateway-level observability.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            See All Connectors
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-mist/70">
            Site
            <select
              value={site}
              onChange={(event) => onFilterChange(() => setSite(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All sites</option>
              {data.sites.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-mist/70">
            System Type
            <select
              value={system}
              onChange={(event) => onFilterChange(() => setSystem(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All systems</option>
              {data.systems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-mist/60">{kpi.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{kpi.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Connector Health Trend</p>
            <p className="mt-1 text-sm text-mist/65">Connected and degraded connector counts over time.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#9ab0c1" tickLine={false} axisLine={false} />
                <YAxis stroke="#9ab0c1" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#08141f',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="connected" name="Connected" stroke="#1cc28a" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="degraded" name="Degraded" stroke="#f3a712" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <p className="text-lg font-medium text-white">AI Gateway Insights</p>
          {/* AI enrichment gives proactive connector stability recommendations. */}
          <div className="mt-4 space-y-4 text-sm leading-7 text-mist/78">
            <p>{data.aiInsights.summary}</p>
            <p>{data.aiInsights.forecast}</p>
            <p className="text-signal">{data.aiInsights.recommendation}</p>
          </div>
        </article>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Connector Status Table</p>
          <p className="mt-1 text-sm text-mist/65">
            Integration endpoint status with test endpoint and synchronization metrics.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">System</th>
                <th className="pb-3">Site</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Success Rate</th>
                <th className="pb-3">Last Sync</th>
                <th className="pb-3">Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-mist/80 last:border-none">
                  <td className="py-4 text-white">{item.systemName}</td>
                  <td className="py-4">{item.site}</td>
                  <td className="py-4">
                    <StateBadge value={item.status} />
                  </td>
                  <td className="py-4">{item.latencyMs ? `${item.latencyMs} ms` : '-'}</td>
                  <td className="py-4">{item.syncSuccessRate ? `${item.syncSuccessRate.toFixed(1)}%` : '-'}</td>
                  <td className="py-4">{formatDateTime(item.lastSyncedAt)}</td>
                  <td className="py-4 text-signal">{item.endpoint}</td>
                </tr>
              ))}
              {!pageItems.length ? (
                <tr>
                  <td colSpan={7} className="py-4 text-mist/70">
                    No connectors found for selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
            Page {page} of {totalPages} • {filteredConnectors.length} connectors
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous connectors page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next connectors page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#050d15]/75 p-4 pt-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0b1622] p-5 shadow-panel md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">All Integration Connectors</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist/75 transition hover:bg-white/5 hover:text-white"
                aria-label="Close connectors modal"
              >
                ×
              </button>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {data.connectors.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">
                      {item.systemName} ({item.systemType})
                    </p>
                    <StateBadge value={item.status} className="shrink-0" />
                  </div>
                  <p className="mt-2 text-sm text-mist/75">{item.notes}</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-xs text-signal">
                    <Link2 className="h-3.5 w-3.5" />
                    {item.endpoint}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
