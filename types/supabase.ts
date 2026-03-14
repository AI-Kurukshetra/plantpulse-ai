export interface Database {
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged: boolean;
          created_at: string;
          description: string;
          equipment_id: string | null;
          id: string;
          plant_id: string;
          severity: 'critical' | 'warning' | 'info';
          source: string;
          title: string;
        };
      };
      emissions: {
        Row: {
          carbon_factor: number;
          energy_kwh: number;
          emissions_kg_co2: number;
          equipment_id: string | null;
          id: number;
          measured_at: string;
          plant_id: string;
        };
      };
      energy_consumption: {
        Row: {
          energy_per_unit: number | null;
          equipment_id: string | null;
          id: number;
          measured_at: string;
          plant_id: string;
          production_units: number;
          usage_kwh: number;
        };
      };
      equipment: {
        Row: {
          category: string;
          created_at: string;
          health_score: number;
          id: string;
          installed_at: string | null;
          name: string;
          plant_id: string;
          service_interval_hours: number;
          status: 'running' | 'idle' | 'maintenance' | 'offline';
        };
      };
      maintenance_schedules: {
        Row: {
          created_at: string;
          equipment_id: string;
          id: string;
          notes: string | null;
          scheduled_for: string;
          service_interval_hours: number;
          status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
        };
      };
      measurements: {
        Row: {
          id: number;
          recorded_at: string;
          sensor_id: string;
          value: number;
        };
      };
      plants: {
        Row: {
          created_at: string;
          id: string;
          location: string;
          name: string;
          target_oee: number;
          timezone: string;
        };
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          plant_id: string | null;
          role_id: string;
        };
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: 'admin' | 'plant_manager' | 'technician';
        };
      };
      sensors: {
        Row: {
          created_at: string;
          equipment_id: string;
          id: string;
          label: string;
          sensor_type: 'temperature' | 'vibration' | 'runtime' | 'energy' | 'emissions';
          unit: string;
        };
      };
    };
  };
}
