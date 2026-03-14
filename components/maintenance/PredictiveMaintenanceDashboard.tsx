'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { MaintenanceRecommendation, MaintenanceScheduleItem, MockMaintenanceScheduleItem } from '@/types';
import { formatDateTime } from '@/utils/format';

interface PredictiveMaintenanceDashboardProps {
  recommendations: MaintenanceRecommendation[];
  schedule: MaintenanceScheduleItem[];
  mockSchedule: MockMaintenanceScheduleItem[];
}

const PAGE_SIZE = 5;

function getSeverityPillClass(severity: MaintenanceRecommendation['severity']) {
  if (severity === 'critical') {
    return 'bg-danger/20 text-danger';
  }
  if (severity === 'warning') {
    return 'bg-amber-400/20 text-amber-200';
  }
  return 'bg-sky-400/20 text-sky-200';
}

function getStatusPillClass(status: MaintenanceScheduleItem['status']) {
  if (status === 'overdue') {
    return 'bg-danger/20 text-danger';
  }
  if (status === 'in_progress') {
    return 'bg-signal/20 text-signal';
  }
  if (status === 'completed') {
    return 'bg-emerald-400/20 text-emerald-200';
  }
  return 'bg-white/10 text-mist/80';
}

export function PredictiveMaintenanceDashboard({
  recommendations,
  schedule,
  mockSchedule
}: PredictiveMaintenanceDashboardProps) {
  const [equipmentQuery, setEquipmentQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | MaintenanceRecommendation['severity']>('all');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | MaintenanceScheduleItem['status']>('all');
  const [recommendationPage, setRecommendationPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [mockPage, setMockPage] = useState(1);

  // Filtering keeps predictive recommendations focused without mutating source data shape.
  const filteredRecommendations = recommendations.filter((item) => {
    const byEquipment =
      !equipmentQuery.trim() || item.equipmentName.toLowerCase().includes(equipmentQuery.trim().toLowerCase());
    const bySeverity = severityFilter === 'all' || item.severity === severityFilter;
    return byEquipment && bySeverity;
  });

  const filteredSchedule = schedule.filter((item) => {
    const byEquipment =
      !equipmentQuery.trim() || item.equipmentName.toLowerCase().includes(equipmentQuery.trim().toLowerCase());
    const byStatus = scheduleStatusFilter === 'all' || item.status === scheduleStatusFilter;
    return byEquipment && byStatus;
  });

  const recommendationTotalPages = Math.max(1, Math.ceil(filteredRecommendations.length / PAGE_SIZE));
  const scheduleTotalPages = Math.max(1, Math.ceil(filteredSchedule.length / PAGE_SIZE));
  const mockTotalPages = Math.max(1, Math.ceil(mockSchedule.length / PAGE_SIZE));

  const recommendationSlice = filteredRecommendations.slice(
    (recommendationPage - 1) * PAGE_SIZE,
    recommendationPage * PAGE_SIZE
  );
  const scheduleSlice = filteredSchedule.slice((schedulePage - 1) * PAGE_SIZE, schedulePage * PAGE_SIZE);
  const mockSlice = mockSchedule.slice((mockPage - 1) * PAGE_SIZE, mockPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-ink/45 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-mist/50">AI recommendations</p>
          <p className="mt-2 text-2xl font-semibold text-white">{recommendations.length}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-ink/45 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-mist/50">Critical cases</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {recommendations.filter((item) => item.severity === 'critical').length}
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-ink/45 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-mist/50">Scheduled interventions</p>
          <p className="mt-2 text-2xl font-semibold text-white">{schedule.length + mockSchedule.length}</p>
        </article>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
        <div className="mb-4">
          <p className="text-lg font-medium text-white">Predictive Recommendations</p>
          <p className="mt-1 text-sm text-mist/65">
            AI insights are merged with live equipment metrics to prioritize maintenance actions.
          </p>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm text-mist/70">
            Equipment Search
            <input
              value={equipmentQuery}
              onChange={(event) => {
                setEquipmentQuery(event.target.value);
                setRecommendationPage(1);
                setSchedulePage(1);
              }}
              placeholder="Filter by equipment name"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none placeholder:text-mist/35"
            />
          </label>
          <label className="text-sm text-mist/70">
            Recommendation Severity
            <select
              value={severityFilter}
              onChange={(event) => {
                setSeverityFilter(event.target.value as typeof severityFilter);
                setRecommendationPage(1);
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </label>
          <label className="text-sm text-mist/70">
            Live Schedule Status
            <select
              value={scheduleStatusFilter}
              onChange={(event) => {
                setScheduleStatusFilter(event.target.value as typeof scheduleStatusFilter);
                setSchedulePage(1);
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            >
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-mist/50">
              <tr>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">AI Insight</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {!recommendationSlice.length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-5 text-mist/70">
                    No recommendations found for the current filter.
                  </td>
                </tr>
              ) : null}
              {recommendationSlice.map((item) => (
                <tr key={item.equipmentId} className="border-t border-white/10 text-mist/80">
                  <td className="px-4 py-3 font-medium text-white">{item.equipmentName}</td>
                  <td className="px-4 py-3">{item.reasons.join(' | ')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${getSeverityPillClass(item.severity)}`}
                    >
                      {item.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
            Page {recommendationPage} of {recommendationTotalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={recommendationPage <= 1}
              className="inline-flex items-center justify-center px-3"
              onClick={() => setRecommendationPage((page) => Math.max(1, page - 1))}
              aria-label="Previous recommendations page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              disabled={recommendationPage >= recommendationTotalPages}
              className="inline-flex items-center justify-center px-3"
              onClick={() => setRecommendationPage((page) => Math.min(recommendationTotalPages, page + 1))}
              aria-label="Next recommendations page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Live Maintenance Schedule</p>
            <p className="mt-1 text-sm text-mist/65">Upcoming and active jobs from maintenance scheduling records.</p>
          </div>

          <div className="max-h-[420px] overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.03] text-left text-mist/50">
                <tr>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {!scheduleSlice.length ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-5 text-mist/70">
                      No live maintenance schedules found for the selected filters.
                    </td>
                  </tr>
                ) : null}
                {scheduleSlice.map((item) => (
                  <tr key={item.id} className="border-t border-white/10 text-mist/80">
                    <td className="px-4 py-3 text-white">
                      <p className="font-medium">{item.equipmentName}</p>
                      {item.aiRecommendation ? <p className="mt-1 text-xs text-signal">{item.aiRecommendation}</p> : null}
                    </td>
                    <td className="px-4 py-3">{formatDateTime(item.scheduledFor)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${getStatusPillClass(item.status)}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
              Page {schedulePage} of {scheduleTotalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={schedulePage <= 1}
                className="inline-flex items-center justify-center px-3"
                onClick={() => setSchedulePage((page) => Math.max(1, page - 1))}
                aria-label="Previous live schedule page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                disabled={schedulePage >= scheduleTotalPages}
                className="inline-flex items-center justify-center px-3"
                onClick={() => setSchedulePage((page) => Math.min(scheduleTotalPages, page + 1))}
                aria-label="Next live schedule page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
          <div className="mb-4">
            <p className="text-lg font-medium text-white">Scheduled Maintenance (Mock Data)</p>
            <p className="mt-1 text-sm text-mist/65">
              Mock rows are included for testing schedule workflows when live data is sparse.
            </p>
          </div>

          <div className="max-h-[420px] overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.03] text-left text-mist/50">
                <tr>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockSlice.map((item) => (
                  <tr key={item.id} className="border-t border-white/10 text-mist/80">
                    <td className="px-4 py-3 font-medium text-white">{item.equipmentName}</td>
                    <td className="px-4 py-3">{formatDateTime(item.scheduledFor)}</td>
                    <td className="px-4 py-3 capitalize">{item.maintenanceType.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${getStatusPillClass(item.status)}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/55">
              Page {mockPage} of {mockTotalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={mockPage <= 1}
                className="inline-flex items-center justify-center px-3"
                onClick={() => setMockPage((page) => Math.max(1, page - 1))}
                aria-label="Previous mock schedule page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                disabled={mockPage >= mockTotalPages}
                className="inline-flex items-center justify-center px-3"
                onClick={() => setMockPage((page) => Math.min(mockTotalPages, page + 1))}
                aria-label="Next mock schedule page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
