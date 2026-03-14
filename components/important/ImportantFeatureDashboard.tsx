'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
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
import type { ImportantFeatureData } from '@/services/importantFeaturesService';

const PAGE_SIZE = 8;

function severityClass(severity: 'critical' | 'warning' | 'info' | undefined) {
  if (severity === 'critical') return 'bg-danger/20 text-danger';
  if (severity === 'warning') return 'bg-amber-400/20 text-amber-200';
  return 'bg-sky-400/20 text-sky-200';
}

export function ImportantFeatureDashboard({
  data,
  showModal,
  customPanel
}: {
  data: ImportantFeatureData;
  showModal?: boolean;
  customPanel?: React.ReactNode;
}) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [site, setSite] = useState<'all' | string>('all');
  const [equipmentType, setEquipmentType] = useState<'all' | string>('all');
  const [kpi, setKpi] = useState<'all' | string>('all');
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const filteredTrend = useMemo(() => {
    if (timeRange === '7d') return data.trend.slice(-7);
    if (timeRange === '30d') return data.trend.slice(-30);
    return data.trend.slice(-90);
  }, [data.trend, timeRange]);

  const filteredRows = useMemo(
    () =>
      data.rows.filter((row) => {
        const bySite = site === 'all' || row.site === site;
        const byType = equipmentType === 'all' || row.equipmentType === equipmentType;
        const byKpi = kpi === 'all' || row.kpi === kpi;
        return bySite && byType && byKpi;
      }),
    [data.rows, equipmentType, kpi, site]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFilterChange = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-lg font-medium text-white">{data.title}</p>
            <p className="mt-1 text-sm text-mist/65">{data.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {showModal && data.modalItems?.length ? (
              <Button variant="secondary" onClick={() => setOpenModal(true)}>
                See All
              </Button>
            ) : null}
            <Button variant="secondary" className="inline-flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm text-mist/70">
            Time Range
            <select
              value={timeRange}
              onChange={(event) => onFilterChange(() => setTimeRange(event.target.value as typeof timeRange))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>
          <label className="text-sm text-mist/70">
            Site
            <select
              value={site}
              onChange={(event) => onFilterChange(() => setSite(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All sites</option>
              {data.filterOptions.sites.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-mist/70">
            Equipment Type
            <select
              value={equipmentType}
              onChange={(event) => onFilterChange(() => setEquipmentType(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All types</option>
              {data.filterOptions.equipmentTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-mist/70">
            KPI
            <select
              value={kpi}
              onChange={(event) => onFilterChange(() => setKpi(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All KPIs</option>
              {data.filterOptions.kpis.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpiItem) => (
          <article key={kpiItem.label} className="rounded-[24px] border border-white/10 bg-ink/50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-mist/60">{kpiItem.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{kpiItem.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Trend Analysis</p>
            <p className="mt-1 text-sm text-mist/65">Historical trend with AI-assisted signal interpretation.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrend}>
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
                <Line type="monotone" dataKey="primary" name={data.primaryLabel} stroke="#1cc28a" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="secondary" name={data.secondaryLabel} stroke="#f3a712" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <p className="text-lg font-medium text-white">AI Insights</p>
          {/* AI enrichment returned from service is presented here as actionable context. */}
          <div className="mt-4 space-y-4 text-sm leading-7 text-mist/78">
            <p>{data.aiInsights.summary}</p>
            <p>{data.aiInsights.forecast}</p>
            <p className="text-signal">{data.aiInsights.recommendation}</p>
          </div>
        </article>
      </section>

      {customPanel}

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Operational Table</p>
          <p className="mt-1 text-sm text-mist/65">Feature-specific rows with filters, pagination, and severity indicators.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-mist/50">
              <tr className="border-b border-white/10">
                <th className="pb-3">Site</th>
                <th className="pb-3">Equipment</th>
                <th className="pb-3">KPI</th>
                {data.tableHeaders.slice(3).map((header) => (
                  <th key={header} className="pb-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-mist/80 last:border-none">
                  <td className="py-4 text-white">{row.site}</td>
                  <td className="py-4">{row.equipmentType}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span>{row.kpi}</span>
                      {row.severity ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase ${severityClass(row.severity)}`}>
                          {row.severity}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  {row.values.map((value, idx) => (
                    <td key={`${row.id}-${idx}`} className="py-4">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
              {!pageRows.length ? (
                <tr>
                  <td colSpan={Math.max(4, data.tableHeaders.length)} className="py-4 text-mist/70">
                    No records found for selected filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
            Page {page} of {totalPages} • {filteredRows.length} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous table page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              className="inline-flex items-center justify-center px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              aria-label="Next table page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {openModal && data.modalItems?.length ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#050d15]/75 p-4 pt-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0b1622] p-5 shadow-panel md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{data.title} - Full List</h2>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mist/75 transition hover:bg-white/5 hover:text-white"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {data.modalItems.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-mist/75">{item.body}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-signal">{item.meta}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
