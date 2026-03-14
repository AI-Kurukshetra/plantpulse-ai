import type { RolePermissionMatrix, RolePermissionProfile } from '@/types';

export function getRbacPermissionMatrix(): RolePermissionMatrix {
  return {
    modules: [
      'dashboard',
      'equipment',
      'maintenance',
      'analytics',
      'sustainability',
      'alerts',
      'integrations',
      'users',
      'admin',
      'reports',
      'data_exchange'
    ],
    actions: ['view', 'create', 'update', 'delete', 'approve']
  };
}

export function getRbacProfiles(): RolePermissionProfile[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'profile-admin-core',
      name: 'Admin Core',
      description: 'Full operational governance and system administration.',
      appliesTo: 'admin',
      createdAt: now,
      permissions: {
        dashboard: ['view', 'update'],
        equipment: ['view', 'create', 'update', 'delete'],
        maintenance: ['view', 'create', 'update', 'approve'],
        analytics: ['view', 'update'],
        sustainability: ['view', 'update'],
        alerts: ['view', 'create', 'update', 'approve'],
        integrations: ['view', 'create', 'update', 'approve'],
        users: ['view', 'create', 'update', 'delete', 'approve'],
        admin: ['view', 'create', 'update', 'delete', 'approve'],
        reports: ['view', 'create', 'update', 'delete'],
        data_exchange: ['view', 'create', 'update', 'approve']
      }
    },
    {
      id: 'profile-manager-ops',
      name: 'Plant Manager Operations',
      description: 'Operational control with limited governance authority.',
      appliesTo: 'plant_manager',
      createdAt: now,
      permissions: {
        dashboard: ['view'],
        equipment: ['view', 'update'],
        maintenance: ['view', 'create', 'update'],
        analytics: ['view'],
        sustainability: ['view'],
        alerts: ['view', 'update'],
        integrations: ['view'],
        users: ['view'],
        admin: [],
        reports: ['view', 'create'],
        data_exchange: ['view']
      }
    },
    {
      id: 'profile-tech-field',
      name: 'Technician Field',
      description: 'Field execution profile for alerts, inspections, and updates.',
      appliesTo: 'technician',
      createdAt: now,
      permissions: {
        dashboard: ['view'],
        equipment: ['view', 'update'],
        maintenance: ['view', 'update'],
        analytics: [],
        sustainability: [],
        alerts: ['view', 'update'],
        integrations: [],
        users: [],
        admin: [],
        reports: ['view'],
        data_exchange: []
      }
    }
  ];
}
