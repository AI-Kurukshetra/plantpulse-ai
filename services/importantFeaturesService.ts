import { createHash } from 'node:crypto';
import { unstable_cache } from 'next/cache';

export type ImportantFeatureId =
  | 'multi_site_fleet'
  | 'cost_optimization'
  | 'regulatory_compliance'
  | 'resource_utilization'
  | 'alert_management'
  | 'historical_analysis'
  | 'mobile_operations'
  | 'custom_report_builder'
  | 'data_export_import'
  | 'benchmark_comparison'
  | 'waste_stream'
  | 'water_usage';

export interface FeatureKpi {
  label: string;
  value: string;
}

export interface FeatureRow {
  id: string;
  site: string;
  equipmentType: string;
  kpi: string;
  severity?: 'critical' | 'warning' | 'info';
  values: string[];
}

export interface ImportantFeatureData {
  id: ImportantFeatureId;
  title: string;
  subtitle: string;
  kpis: FeatureKpi[];
  trend: Array<{ label: string; primary: number; secondary: number }>;
  primaryLabel: string;
  secondaryLabel: string;
  tableHeaders: string[];
  rows: FeatureRow[];
  filterOptions: {
    sites: string[];
    equipmentTypes: string[];
    kpis: string[];
  };
  aiInsights: {
    summary: string;
    forecast: string;
    recommendation: string;
  };
  modalItems?: Array<{
    title: string;
    body: string;
    meta: string;
  }>;
}

const baseSites = ['North Plant', 'South Plant', 'West Plant'];
const baseEquipment = ['Utilities', 'Machining', 'Packaging', 'Assembly'];

function seedToNumber(seed: string) {
  return parseInt(createHash('sha256').update(seed).digest('hex').slice(0, 8), 16);
}

function buildTrend(seed: string, basePrimary: number, baseSecondary: number) {
  const salt = seedToNumber(seed);
  return Array.from({ length: 14 }, (_, i) => ({
    label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
      new Date(Date.now() - (13 - i) * 86400000)
    ),
    primary: Number((basePrimary + Math.sin((i + (salt % 5)) / 2.2) * (basePrimary * 0.08)).toFixed(1)),
    secondary: Number((baseSecondary + Math.cos((i + (salt % 7)) / 2.4) * (baseSecondary * 0.1)).toFixed(1))
  }));
}

const getCachedAiInsight = unstable_cache(
  async (feature: ImportantFeatureId, context: string) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          temperature: 0.2,
          max_output_tokens: 220,
          input: [
            {
              role: 'system',
              content: 'Return concise JSON with fields summary, forecast, recommendation. No markdown.'
            },
            {
              role: 'user',
              content: `Feature: ${feature}\nContext:\n${context}`
            }
          ]
        })
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { output_text?: string };
      if (!payload.output_text) {
        return null;
      }
      const parsed = JSON.parse(payload.output_text) as {
        summary?: string;
        forecast?: string;
        recommendation?: string;
      };
      if (!parsed.summary || !parsed.forecast || !parsed.recommendation) {
        return null;
      }
      return {
        summary: parsed.summary,
        forecast: parsed.forecast,
        recommendation: parsed.recommendation
      };
    } catch {
      return null;
    }
  },
  ['plantpulse-important-features-ai'],
  { revalidate: 120 }
);

function fallbackAi(featureTitle: string) {
  return {
    summary: `${featureTitle} indicates stable operations with targeted optimization opportunities.`,
    forecast: `Expected performance remains within operational range over the next cycle.`,
    recommendation: `Prioritize high-variance assets and enforce line-level corrective actions.`
  };
}

function buildFeatureData(id: ImportantFeatureId): Omit<ImportantFeatureData, 'aiInsights'> {
  switch (id) {
    case 'multi_site_fleet':
      return {
        id,
        title: 'Multi-site Fleet Management',
        subtitle: 'Centralized KPI monitoring across facilities with site-level trend visibility.',
        kpis: [
          { label: 'Fleet Production', value: '14.2k units' },
          { label: 'Fleet Energy', value: '82.6 MWh' },
          { label: 'Fleet Emissions', value: '31.4 tCO2' },
          { label: 'Open Alerts', value: '12' }
        ],
        trend: buildTrend(id, 74, 28),
        primaryLabel: 'Fleet OEE',
        secondaryLabel: 'Alert Rate',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Production', 'Energy', 'Emissions', 'Status'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Fleet Performance',
            values: [
              `${420 + siteIdx * 70 + idx * 24}`,
              `${210 + siteIdx * 22 + idx * 11} kWh`,
              `${34 + siteIdx * 4 + idx * 2} kg`,
              idx % 3 === 0 ? 'Watch' : 'Stable'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Fleet Performance', 'Energy', 'Emissions']
        }
      };
    case 'cost_optimization':
      return {
        id,
        title: 'Cost Optimization Recommendations',
        subtitle: 'AI-prioritized operational savings opportunities with confidence scoring.',
        kpis: [
          { label: 'Estimated Monthly Savings', value: '$124k' },
          { label: 'High-Confidence Actions', value: '9' },
          { label: 'Avg Confidence', value: '87%' },
          { label: 'Processes Impacted', value: '16' }
        ],
        trend: buildTrend(id, 92, 68),
        primaryLabel: 'Potential Savings ($k)',
        secondaryLabel: 'Confidence (%)',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Savings', 'Process', 'Confidence', 'Priority'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.slice(0, 3).map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Cost Reduction',
            severity: idx === 0 ? 'critical' : 'warning',
            values: [
              `$${(18 + siteIdx * 4 + idx * 2).toFixed(1)}k`,
              ['Steam Loop', 'Compressor Cycle', 'Batch Scheduling'][idx],
              `${88 - idx * 4}%`,
              idx === 0 ? 'High' : 'Medium'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Cost Reduction', 'Scheduling', 'Utilities']
        },
        modalItems: Array.from({ length: 8 }, (_, idx) => ({
          title: `Optimization Opportunity ${idx + 1}`,
          body: `Adjust line ${((idx % 3) + 1)} setpoints and shift energy-intensive steps to lower tariff windows.`,
          meta: `Estimated savings: $${(9 + idx * 2).toFixed(1)}k • Confidence ${(92 - idx * 3).toFixed(0)}%`
        }))
      };
    case 'regulatory_compliance':
      return {
        id,
        title: 'Regulatory Compliance Management',
        subtitle: 'Compliance status across environmental and safety obligations with violation tracking.',
        kpis: [
          { label: 'Overall Compliance', value: '94%' },
          { label: 'Open Violations', value: '3' },
          { label: 'Overdue Actions', value: '5' },
          { label: 'Site Audits Passed', value: '11/12' }
        ],
        trend: buildTrend(id, 91, 4),
        primaryLabel: 'Compliance Score',
        secondaryLabel: 'Violation Count',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Regulation', 'Status', 'Due Date', 'Action'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Compliance',
            severity: idx === 0 ? 'critical' : idx % 2 ? 'warning' : 'info',
            values: [
              ['EPA Air 14B', 'ISO 14001', 'OSHA 300', 'GHG Scope 2'][idx],
              idx === 0 ? 'Violation' : 'Compliant',
              `2026-0${(idx % 3) + 4}-1${siteIdx}`,
              idx === 0 ? 'Escalate' : 'Review'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Compliance', 'Safety', 'Environment']
        }
      };
    case 'resource_utilization':
      return {
        id,
        title: 'Resource Utilization Analytics',
        subtitle: 'Material, water, and utility consumption efficiency across lines.',
        kpis: [
          { label: 'Material Utilization', value: '86%' },
          { label: 'Water Intensity', value: '2.8 L/unit' },
          { label: 'Resource Waste', value: '7.4%' },
          { label: 'Optimization Opportunities', value: '14' }
        ],
        trend: buildTrend(id, 83, 7),
        primaryLabel: 'Utilization Score',
        secondaryLabel: 'Waste Ratio',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Material', 'Water', 'Waste', 'Insight'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Resource Efficiency',
            values: [
              `${(84 - idx * 2 + siteIdx).toFixed(1)}%`,
              `${(2.4 + idx * 0.3).toFixed(2)} L/unit`,
              `${(6.2 + idx * 0.7).toFixed(1)}%`,
              idx % 2 ? 'Optimize purge cycle' : 'Within target'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Resource Efficiency', 'Water', 'Waste']
        }
      };
    case 'alert_management':
      return {
        id,
        title: 'Alert Management System',
        subtitle: 'Configurable alerts with severity, escalation workflows, and acknowledgment states.',
        kpis: [
          { label: 'Active Alerts', value: '18' },
          { label: 'Critical Escalations', value: '4' },
          { label: 'Avg Response Time', value: '11 min' },
          { label: 'Auto-Resolved', value: '36%' }
        ],
        trend: buildTrend(id, 18, 9),
        primaryLabel: 'Open Alerts',
        secondaryLabel: 'Escalations',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Severity', 'Timestamp', 'Escalation', 'Action'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Alert Workflow',
            severity: idx === 0 ? 'critical' : idx % 2 ? 'warning' : 'info',
            values: [
              idx === 0 ? 'Critical' : idx % 2 ? 'Warning' : 'Info',
              new Date(Date.now() - (idx + siteIdx) * 3600000).toISOString(),
              idx === 0 ? 'Tier 2' : 'Tier 1',
              idx === 0 ? 'Dispatch team' : 'Monitor'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Alert Workflow', 'Escalation']
        },
        modalItems: Array.from({ length: 10 }, (_, idx) => ({
          title: `Alert ${idx + 1}`,
          body: `Equipment anomaly triggered escalation tier ${idx % 3 === 0 ? '2' : '1'} workflow.`,
          meta: `Severity: ${idx % 3 === 0 ? 'Critical' : idx % 2 ? 'Warning' : 'Info'}`
        }))
      };
    case 'historical_analysis':
      return {
        id,
        title: 'Historical Data Analysis',
        subtitle: 'Time-series comparison across production, energy, emissions, and asset performance.',
        kpis: [
          { label: 'Data Window', value: '180 days' },
          { label: 'Trend Confidence', value: '89%' },
          { label: 'Detected Patterns', value: '21' },
          { label: 'Recurring Issues', value: '6' }
        ],
        trend: buildTrend(id, 76, 33),
        primaryLabel: 'Historical Efficiency',
        secondaryLabel: 'Deviation Index',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Current', '30d Avg', '90d Avg', 'Trend'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: ['Production', 'Energy', 'Emissions', 'Equipment'][idx],
            values: [
              `${(71 + idx * 3 + siteIdx).toFixed(1)}`,
              `${(68 + idx * 2).toFixed(1)}`,
              `${(66 + idx * 2).toFixed(1)}`,
              idx % 2 ? 'Improving' : 'Flat'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Production', 'Energy', 'Emissions', 'Equipment']
        }
      };
    case 'mobile_operations':
      return {
        id,
        title: 'Mobile Operations App',
        subtitle: 'Mobile-optimized KPI and alert surfaces for managers and technicians.',
        kpis: [
          { label: 'Mobile Sessions', value: '1.8k/day' },
          { label: 'Acknowledged Alerts', value: '74%' },
          { label: 'Avg Action Time', value: '8 min' },
          { label: 'Offline Sync Success', value: '98%' }
        ],
        trend: buildTrend(id, 72, 14),
        primaryLabel: 'Mobile Adoption',
        secondaryLabel: 'Critical Alerts Handled',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Manager View', 'Technician View', 'Action', 'Status'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.slice(0, 3).map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Mobile Operations',
            values: [
              `${90 - idx * 4}% readiness`,
              `${86 - idx * 5}% readiness`,
              idx % 2 ? 'Inspect now' : 'Monitor',
              idx % 2 ? 'Pending' : 'Synced'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Mobile Operations', 'Alerts', 'Sync']
        }
      };
    case 'custom_report_builder':
      return {
        id,
        title: 'Custom Report Builder',
        subtitle: 'Selection-based report composition for KPI exports and visualization snapshots.',
        kpis: [
          { label: 'Saved Templates', value: '14' },
          { label: 'Generated Reports', value: '128' },
          { label: 'Avg Build Time', value: '3.2 min' },
          { label: 'Automated Schedules', value: '9' }
        ],
        trend: buildTrend(id, 24, 16),
        primaryLabel: 'Reports Generated',
        secondaryLabel: 'Template Reuse',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Template', 'Metrics', 'Format', 'Status'],
        rows: baseSites.flatMap((site, siteIdx) =>
          ['Executive', 'Operations', 'Sustainability'].map((template, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: baseEquipment[idx],
            kpi: 'Report Build',
            values: [template, `${4 + idx} metrics`, idx % 2 ? 'CSV/PDF' : 'PDF', idx % 2 ? 'Draft' : 'Published']
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Report Build', 'Exports']
        }
      };
    case 'data_export_import':
      return {
        id,
        title: 'Data Export & Import Tools',
        subtitle: 'Format-flexible data exchange with validation status and transfer tracking.',
        kpis: [
          { label: 'Exports Today', value: '47' },
          { label: 'Imports Today', value: '19' },
          { label: 'Validation Failures', value: '2' },
          { label: 'Success Rate', value: '96%' }
        ],
        trend: buildTrend(id, 44, 11),
        primaryLabel: 'Transfers',
        secondaryLabel: 'Validation Errors',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Direction', 'Format', 'Rows', 'Validation'],
        rows: baseSites.flatMap((site, siteIdx) =>
          ['CSV', 'Excel', 'JSON'].map((format, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: baseEquipment[idx],
            kpi: 'Data Exchange',
            values: [
              idx % 2 ? 'Import' : 'Export',
              format,
              `${240 + siteIdx * 35 + idx * 22}`,
              idx === 1 ? 'Warning' : 'Passed'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Data Exchange', 'Validation']
        }
      };
    case 'benchmark_comparison':
      return {
        id,
        title: 'Benchmark Comparison',
        subtitle: 'Performance gap tracking against industry standards with prioritized improvements.',
        kpis: [
          { label: 'Avg Benchmark Gap', value: '7.8 pts' },
          { label: 'Best-in-Class Lines', value: '4' },
          { label: 'Below Benchmark', value: '9' },
          { label: 'Improvement Potential', value: '11%' }
        ],
        trend: buildTrend(id, 79, 84),
        primaryLabel: 'Plant Score',
        secondaryLabel: 'Industry Benchmark',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Current', 'Benchmark', 'Gap', 'AI Suggestion'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Benchmarking',
            values: [
              `${(74 + idx * 2).toFixed(1)}`,
              `${(82 + idx * 1.5).toFixed(1)}`,
              `${(7.5 - idx * 0.4).toFixed(1)} pts`,
              idx % 2 ? 'Tune cycle times' : 'Optimize energy mix'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Benchmarking', 'Gap']
        }
      };
    case 'waste_stream':
      return {
        id,
        title: 'Waste Stream Analytics',
        subtitle: 'Waste generation monitoring and disposal optimization with excess-waste alerts.',
        kpis: [
          { label: 'Waste Generated', value: '42.8 t' },
          { label: 'Recycling Rate', value: '61%' },
          { label: 'Excess Events', value: '5' },
          { label: 'Avoidable Waste', value: '13%' }
        ],
        trend: buildTrend(id, 38, 9),
        primaryLabel: 'Waste Volume',
        secondaryLabel: 'Excess Events',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Stream', 'Volume', 'Disposal Cost', 'Recommendation'],
        rows: baseSites.flatMap((site, siteIdx) =>
          ['Solid', 'Liquid', 'Hazardous', 'Packaging'].map((stream, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: baseEquipment[idx],
            kpi: 'Waste',
            values: [
              stream,
              `${(9 + idx * 2.1 + siteIdx).toFixed(1)} t`,
              `$${(3.2 + idx * 0.8).toFixed(1)}k`,
              idx % 2 ? 'Increase segregation' : 'Within target'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Waste', 'Disposal']
        }
      };
    case 'water_usage':
      return {
        id,
        title: 'Water Usage Optimization',
        subtitle: 'Water intensity tracking with conservation opportunities and AI recommendations.',
        kpis: [
          { label: 'Total Water Use', value: '12.4 ML' },
          { label: 'Water/Unit', value: '2.6 L' },
          { label: 'Conservation Potential', value: '18%' },
          { label: 'Leakage Alerts', value: '4' }
        ],
        trend: buildTrend(id, 2.8, 17),
        primaryLabel: 'Water Intensity',
        secondaryLabel: 'Conservation Opportunity',
        tableHeaders: ['Site', 'Equipment', 'KPI', 'Consumption', 'Efficiency', 'Leak Risk', 'Action'],
        rows: baseSites.flatMap((site, siteIdx) =>
          baseEquipment.map((eq, idx) => ({
            id: `${id}-${siteIdx}-${idx}`,
            site,
            equipmentType: eq,
            kpi: 'Water',
            values: [
              `${(2.1 + idx * 0.4 + siteIdx * 0.2).toFixed(2)} L/unit`,
              `${(88 - idx * 4).toFixed(0)}%`,
              idx === 0 ? 'High' : 'Low',
              idx === 0 ? 'Audit valves' : 'Monitor'
            ]
          }))
        ),
        filterOptions: {
          sites: baseSites,
          equipmentTypes: baseEquipment,
          kpis: ['Water', 'Conservation']
        }
      };
    default:
      return {
        id,
        title: 'Feature',
        subtitle: '',
        kpis: [],
        trend: [],
        primaryLabel: 'Primary',
        secondaryLabel: 'Secondary',
        tableHeaders: [],
        rows: [],
        filterOptions: { sites: [], equipmentTypes: [], kpis: [] }
      };
  }
}

export async function getImportantFeatureData(featureId: ImportantFeatureId): Promise<ImportantFeatureData> {
  const base = buildFeatureData(featureId);
  const context = JSON.stringify({
    title: base.title,
    kpis: base.kpis,
    trendTail: base.trend.slice(-4),
    tableSample: base.rows.slice(0, 4)
  });
  // AI enrichment augments each important feature with predictive narrative and prioritized action.
  const aiInsights = (await getCachedAiInsight(featureId, context)) ?? fallbackAi(base.title);

  return { ...base, aiInsights };
}
