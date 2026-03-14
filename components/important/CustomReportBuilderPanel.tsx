'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';

const availableMetrics = ['Production', 'Energy', 'Emissions', 'OEE', 'Alerts', 'Anomalies', 'Water', 'Waste'];

export function CustomReportBuilderPanel() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Production', 'Energy']);
  const [reportName, setReportName] = useState('Operations Weekly Report');

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => (prev.includes(metric) ? prev.filter((item) => item !== metric) : [...prev, metric]));
  };

  return (
    <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
      <div className="mb-4">
        <p className="text-lg font-medium text-white">Report Builder</p>
        <p className="mt-1 text-sm text-mist/65">
          Selection-based report configuration for custom KPI and chart composition.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <label className="text-sm text-mist/70">
            Report Name
            <input
              value={reportName}
              onChange={(event) => setReportName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-2.5 text-white outline-none"
            />
          </label>
          <div>
            <p className="mb-2 text-sm text-mist/70">Select Metrics</p>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <label
                  key={metric}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink/60 px-3 py-2 text-sm text-mist/80"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={() => toggleMetric(metric)}
                    className="h-4 w-4"
                  />
                  {metric}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Preview</Button>
            <Button>Save Template</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white">Live Report Preview</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mist/55">{reportName}</p>
          <ul className="mt-3 space-y-2 text-sm text-mist/78">
            {selectedMetrics.map((metric) => (
              <li key={metric} className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2">
                {metric} chart + KPI widget
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary">Export PDF</Button>
            <Button variant="secondary">Export CSV</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
