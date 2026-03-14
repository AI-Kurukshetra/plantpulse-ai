import type { Route } from 'next';
import type { UserRole } from '@/types';

/**
 * Sidebar navigation aligned with project-definition.md must-have and important features.
 * One menu item per route to avoid duplicate highlights; role-based visibility is applied in SidebarNav.
 */
export const navigation = [
  // Must-have (1–8, 16, 18): Real-time monitoring, energy, equipment, maintenance, sustainability, analytics, anomaly, integrations, RBAC
  { href: '/dashboard' as Route, label: 'Real-time Monitoring', roles: ['admin', 'plant_manager', 'technician'] as UserRole[] },
  { href: '/equipment' as Route, label: 'Equipment Health', roles: ['admin', 'plant_manager', 'technician'] as UserRole[] },
  { href: '/maintenance' as Route, label: 'Predictive Maintenance', roles: ['admin', 'plant_manager', 'technician'] as UserRole[] },
  { href: '/sustainability' as Route, label: 'Sustainability', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/analytics' as Route, label: 'Production Efficiency', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/alerts' as Route, label: 'Anomaly Detection', roles: ['admin', 'plant_manager', 'technician'] as UserRole[] },
  { href: '/integrations' as Route, label: 'Integration API Gateway', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/rbac' as Route, label: 'Role-based Access Control', roles: ['admin'] as UserRole[] },
  // Important features (9–15, 17, 19–20, 22–23)
  { href: '/fleet' as Route, label: 'Multi-site Fleet', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/cost-optimization' as Route, label: 'Cost Optimization', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/compliance' as Route, label: 'Regulatory Compliance', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/resource-utilization' as Route, label: 'Resource Utilization', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/alert-management' as Route, label: 'Alert Management', roles: ['admin', 'plant_manager', 'technician'] as UserRole[] },
  { href: '/historical-analysis' as Route, label: 'Historical Analysis', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/mobile-operations' as Route, label: 'Mobile Operations', roles: ['admin', 'plant_manager', 'technician'] as UserRole[] },
  { href: '/report-builder' as Route, label: 'Custom Reports', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/data-exchange' as Route, label: 'Data Export / Import', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/benchmark-comparison' as Route, label: 'Benchmark Comparison', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/waste-analytics' as Route, label: 'Waste Analytics', roles: ['admin', 'plant_manager'] as UserRole[] },
  { href: '/water-optimization' as Route, label: 'Water Optimization', roles: ['admin', 'plant_manager'] as UserRole[] },
  // Administration
  { href: '/users' as Route, label: 'Users', roles: ['admin'] as UserRole[] }
];
