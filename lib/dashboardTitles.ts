/**
 * Pathname → header title and subtitle for the dashboard layout.
 * Used so the sidebar layout can show the correct header even while the page segment is loading.
 */
export const dashboardTitles: Record<
  string,
  { title: string; subtitle: string }
> = {
  '/dashboard': {
    title: 'Smart Plant Intelligence Platform',
    subtitle: 'PlantPulse AI combines OEE, energy consumption, emissions, equipment health, and alerts into a single plant operations view.'
  },
  '/equipment': {
    title: 'Equipment Health',
    subtitle: 'Asset condition, performance metrics, and AI-driven insights.'
  },
  '/maintenance': {
    title: 'Predictive Maintenance',
    subtitle: 'AI-driven maintenance recommendations and schedule overview.'
  },
  '/sustainability': {
    title: 'Sustainability',
    subtitle: 'Emissions tracking, sustainability scoring, and environmental insights.'
  },
  '/analytics': {
    title: 'Production Efficiency',
    subtitle: 'OEE, throughput, quality metrics, and bottleneck analysis.'
  },
  '/alerts': {
    title: 'Anomaly Detection',
    subtitle: 'ML-based operational anomalies and recommended actions.'
  },
  '/integrations': {
    title: 'Integration API Gateway',
    subtitle: 'ERP, MES, SCADA, and industrial protocol connections.'
  },
  '/rbac': {
    title: 'Role-based Access Control',
    subtitle: 'Permissions and user access management.'
  },
  '/fleet': {
    title: 'Multi-site Fleet Management',
    subtitle: 'Centralized multi-facility monitoring and KPI rollups.'
  },
  '/cost-optimization': {
    title: 'Cost Optimization',
    subtitle: 'AI-powered cost reduction recommendations.'
  },
  '/compliance': {
    title: 'Regulatory Compliance',
    subtitle: 'Environmental and safety compliance tracking.'
  },
  '/resource-utilization': {
    title: 'Resource Utilization',
    subtitle: 'Materials, water, and resource usage analytics.'
  },
  '/alert-management': {
    title: 'Alert Management',
    subtitle: 'Configurable alerts and escalation workflows.'
  },
  '/historical-analysis': {
    title: 'Historical Analysis',
    subtitle: 'Time-series and trend analysis.'
  },
  '/mobile-operations': {
    title: 'Mobile Operations',
    subtitle: 'Mobile access to metrics and alerts.'
  },
  '/report-builder': {
    title: 'Custom Reports',
    subtitle: 'Custom reports and visualizations.'
  },
  '/data-exchange': {
    title: 'Data Export / Import',
    subtitle: 'Export and import in multiple formats.'
  },
  '/benchmark-comparison': {
    title: 'Benchmark Comparison',
    subtitle: 'Industry benchmarks and best practices.'
  },
  '/waste-analytics': {
    title: 'Waste Analytics',
    subtitle: 'Waste generation and disposal optimization.'
  },
  '/water-optimization': {
    title: 'Water Optimization',
    subtitle: 'Water consumption and conservation.'
  },
  '/plants': {
    title: 'Plant Profile',
    subtitle: 'Primary production site and expansion path.'
  },
  '/admin': {
    title: 'Admin',
    subtitle: 'System and user administration.'
  },
  '/users': {
    title: 'Users',
    subtitle: 'User and role management.'
  }
};

const DEFAULT_TITLE = 'PlantPulse AI';
const DEFAULT_SUBTITLE = 'Loading…';

export function getDashboardHeader(pathname: string): { title: string; subtitle: string } {
  return dashboardTitles[pathname] ?? { title: DEFAULT_TITLE, subtitle: DEFAULT_SUBTITLE };
}
