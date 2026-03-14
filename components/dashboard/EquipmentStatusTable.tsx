'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { ModernSelect } from '@/components/common/ModernSelect';
import { StateBadge } from '@/components/common/StateBadge';
import type { Equipment } from '@/types';

interface EquipmentStatusTableProps {
  equipment: Equipment[];
  showControls?: boolean;
}

export function EquipmentStatusTable({ equipment, showControls = false }: EquipmentStatusTableProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | Equipment['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const categories = useMemo(() => Array.from(new Set(equipment.map((item) => item.category))), [equipment]);

  const filteredEquipment = useMemo(() => {
    if (!showControls) {
      return equipment;
    }

    const loweredSearch = search.trim().toLowerCase();
    return equipment.filter((asset) => {
      const matchesStatus = statusFilter === 'all' ? true : asset.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' ? true : asset.category === categoryFilter;
      const matchesSearch = loweredSearch
        ? asset.name.toLowerCase().includes(loweredSearch) || asset.category.toLowerCase().includes(loweredSearch)
        : true;
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [categoryFilter, equipment, search, showControls, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / pageSize));
  const pagedEquipment = showControls
    ? filteredEquipment.slice((page - 1) * pageSize, page * pageSize)
    : filteredEquipment;

  const handleFilterChange = (updater: () => void) => {
    // Filters reset paging to keep results predictable.
    updater();
    setPage(1);
  };

  return (
    <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-white">Equipment Health</p>
          <p className="mt-1 text-sm text-mist/65">Temperature, vibration, runtime and health score by asset.</p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-mist/55">
          Live status
        </span>
      </div>

      {showControls ? (
        // Controls are enabled for the dedicated Equipment Health page only.
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          {/* Search uses the same label rhythm as selects to keep filter row aligned. */}
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mist/55">Search</span>
            <input
              type="text"
              placeholder="Search equipment or type"
              value={search}
              onChange={(event) => handleFilterChange(() => setSearch(event.target.value))}
              className="h-11 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 text-sm text-white outline-none placeholder:text-mist/40"
            />
          </label>
          <ModernSelect
            label="Status"
            value={statusFilter}
            onChange={(value) => handleFilterChange(() => setStatusFilter(value as 'all' | Equipment['status']))}
            options={[
              { label: 'All status', value: 'all' },
              { label: 'Running', value: 'running' },
              { label: 'Fault', value: 'maintenance' },
              { label: 'Idle', value: 'idle' },
              { label: 'Offline', value: 'offline' }
            ]}
          />
          <ModernSelect
            label="Equipment type"
            value={categoryFilter}
            onChange={(value) => handleFilterChange(() => setCategoryFilter(value))}
            options={[
              { label: 'All types', value: 'all' },
              ...categories.map((category) => ({ label: category, value: category }))
            ]}
          />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-mist/50">
            <tr className="border-b border-white/10">
              <th className="pb-3">Equipment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Temperature</th>
              <th className="pb-3">Vibration</th>
              <th className="pb-3">Runtime</th>
              <th className="pb-3">Health</th>
              <th className="pb-3">Emissions</th>
              <th className="pb-3">AI Insight</th>
            </tr>
          </thead>
          <tbody>
            {pagedEquipment.map((asset) => (
              <tr key={asset.id} className="border-b border-white/5 text-mist/80 last:border-none">
                <td className="py-4">
                  <p className="font-medium text-white">{asset.name}</p>
                  <p className="text-xs text-mist/50">{asset.category}</p>
                </td>
                <td className="py-4">
                  <StateBadge
                    value={asset.status}
                    label={asset.status === 'maintenance' || asset.status === 'offline' ? 'fault' : undefined}
                  />
                </td>
                <td className="py-4">{asset.temperature} C</td>
                <td className="py-4">{asset.vibration} mm/s</td>
                <td className="py-4">{asset.runtimeHours.toLocaleString()} hrs</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 rounded-full bg-white/10">
                      <div
                        className={clsx(
                          'h-2 rounded-full',
                          asset.healthScore > 80
                            ? 'bg-signal'
                            : asset.healthScore > 65
                              ? 'bg-amber'
                              : 'bg-danger'
                        )}
                        style={{ width: `${asset.healthScore}%` }}
                      />
                    </div>
                    <span>{asset.healthScore}%</span>
                  </div>
                </td>
                <td className="py-4">{asset.emissionsKgCo2} kg CO2</td>
                <td className="py-4 text-xs text-mist/70">
                  {asset.aiInsight ? (
                    <>
                      <p className="text-signal">{asset.aiInsight.summary}</p>
                      <p className="mt-1">
                        Risk {(asset.aiInsight.anomalyProbability * 100).toFixed(0)}% • ETA{' '}
                        {asset.aiInsight.predictedFailureWindowHours}h
                      </p>
                    </>
                  ) : (
                    'Baseline monitoring'
                  )}
                </td>
              </tr>
            ))}
            {showControls && !pagedEquipment.length ? (
              <tr>
                <td className="py-4 text-mist/65" colSpan={8}>
                  No equipment matches the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {showControls ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-mist/55">
            Page {page} of {totalPages} • {filteredEquipment.length} assets
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous equipment page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-mist/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next equipment page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-mist/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
