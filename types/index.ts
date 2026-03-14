export type UserRole = 'admin' | 'plant_manager' | 'technician';

export interface AuthenticatedUser {
  email: string;
  fullName: string | null;
  id: string;
  plantId: string | null;
  role: UserRole;
}

export type EquipmentStatus = 'running' | 'idle' | 'maintenance' | 'offline';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Plant {
  id: string;
  name: string;
  location: string;
  lineCount: number;
  targetOee: number;
  timezone?: string;
  aiSummary?: string;
  sustainabilityContext?: string;
}

export interface Equipment {
  id: string;
  plantId: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  temperature: number;
  vibration: number;
  runtimeHours: number;
  healthScore: number;
  serviceIntervalHours: number;
  lastServiceDate: string;
  energyKwh: number;
  emissionsKgCo2: number;
  aiInsight?: {
    summary: string;
    recommendation: string;
    anomalyProbability: number;
    predictedFailureWindowHours: number;
  };
}

export interface Alert {
  id: string;
  plantId?: string;
  equipmentId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  createdAt: string;
  acknowledged: boolean;
  source?: string;
  aiSummary?: string;
  recommendedAction?: string;
  generatedByAI?: boolean;
}

export interface EnergyPoint {
  label: string;
  usageKwh: number;
  productionUnits: number;
  energyPerUnit: number;
  aiForecast?: boolean;
  aiInsight?: string;
}

export interface DashboardMetrics {
  oee: number;
  throughput: number;
  activeAlerts: number;
  equipmentOnline: number;
  totalEquipment: number;
  totalEnergyKwh: number;
  emissionsKgCo2: number;
}

export interface MaintenanceRecommendation {
  equipmentId: string;
  equipmentName: string;
  reasons: string[];
  severity: AlertSeverity;
}

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';

export interface MaintenanceScheduleItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  scheduledFor: string;
  serviceIntervalHours: number;
  status: MaintenanceStatus;
  notes: string | null;
  aiRecommendation?: string;
}

export interface MockMaintenanceScheduleItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  scheduledFor: string;
  maintenanceType: 'inspection' | 'calibration' | 'preventive' | 'parts_replacement';
  status: MaintenanceStatus;
  notes: string | null;
}

export interface SustainabilitySnapshot {
  totalEnergyKwh: number;
  totalEmissionsKgCo2: number;
  averageCarbonFactor: number;
  sustainabilityScore: number;
  trendNarrative: string;
}

export interface EmissionsRecord {
  id: string;
  plantId: string;
  plantName: string;
  equipmentId: string | null;
  equipmentName: string;
  equipmentCategory: string;
  measuredAt: string;
  co2Kg: number;
  noxKg: number;
  soxKg: number;
  ch4Kg: number;
  carbonFactor: number;
  aiInsight?: string;
}

export interface EmissionsAiInsights {
  trendSummary: string;
  anomalySummary: string;
  optimizationRecommendation: string;
  predictedNextPeriodCo2Kg: number;
}

export interface EmissionsDashboardData {
  plantOptions: Array<{ id: string; name: string }>;
  equipmentTypeOptions: string[];
  records: EmissionsRecord[];
  aiInsights: EmissionsAiInsights;
}

export interface ProductionEfficiencyRecord {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  line: string;
  status: EquipmentStatus;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  throughput: number;
  defectRate: number;
  yieldRate: number;
  bottleneckRisk: number;
  aiInsight?: string;
}

export interface ProductionTrendPoint {
  label: string;
  oee: number;
  throughput: number;
  defectRate: number;
}

export interface ProductionEfficiencyAiInsights {
  trendSummary: string;
  bottleneckPrediction: string;
  recommendation: string;
  predictedNextOee: number;
}

export interface ProductionEfficiencyDashboardData {
  plantOptions: Array<{ id: string; name: string }>;
  lineOptions: string[];
  records: ProductionEfficiencyRecord[];
  trend: ProductionTrendPoint[];
  aiInsights: ProductionEfficiencyAiInsights;
}

export interface SustainabilityScoringRecord {
  line: string;
  plantId: string;
  plantName: string;
  sustainabilityScore: number;
  benchmarkScore: number;
  energyPerUnit: number;
  carbonFactor: number;
  co2Kg: number;
  noxKg: number;
  soxKg: number;
  trendDelta: number;
  aiInsight?: string;
}

export interface SustainabilityScoringTrendPoint {
  label: string;
  sustainabilityScore: number;
  benchmarkScore: number;
}

export interface SustainabilityScoringAiInsights {
  trendSummary: string;
  benchmarkSummary: string;
  recommendation: string;
  predictedNextScore: number;
}

export interface SustainabilityScoringDashboardData {
  plantOptions: Array<{ id: string; name: string }>;
  lineOptions: string[];
  records: SustainabilityScoringRecord[];
  trend: SustainabilityScoringTrendPoint[];
  aiInsights: SustainabilityScoringAiInsights;
}

export interface AnomalyDetectionRecord {
  id: string;
  plantId: string;
  plantName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  measuredAt: string;
  anomalyScore: number;
  severity: AlertSeverity;
  predictedImpact: string;
  recommendation: string;
  source: 'telemetry' | 'alert' | 'ai';
  aiInsight?: string;
}

export interface AnomalyTrendPoint {
  label: string;
  anomalyCount: number;
  averageScore: number;
}

export interface AnomalyDetectionAiInsights {
  trendSummary: string;
  anomalyHotspot: string;
  recommendation: string;
  predictedNextAnomalyCount: number;
}

export interface AnomalyDetectionDashboardData {
  plantOptions: Array<{ id: string; name: string }>;
  equipmentTypeOptions: string[];
  records: AnomalyDetectionRecord[];
  trend: AnomalyTrendPoint[];
  aiInsights: AnomalyDetectionAiInsights;
}

export interface IntegrationConnector {
  id: string;
  systemType: 'ERP' | 'MES' | 'SCADA' | 'Historian';
  systemName: string;
  site: string;
  status: 'connected' | 'degraded' | 'offline' | 'planned';
  latencyMs: number;
  syncSuccessRate: number;
  lastSyncedAt: string;
  endpoint: string;
  notes: string;
}

export interface IntegrationGatewayInsights {
  summary: string;
  forecast: string;
  recommendation: string;
}

export interface IntegrationGatewayDashboardData {
  connectors: IntegrationConnector[];
  kpis: Array<{ label: string; value: string }>;
  trend: Array<{ label: string; connected: number; degraded: number }>;
  sites: string[];
  systems: Array<IntegrationConnector['systemType']>;
  aiInsights: IntegrationGatewayInsights;
}

export interface RolePermissionMatrix {
  modules: string[];
  actions: string[];
}

export interface RolePermissionProfile {
  id: string;
  name: string;
  description: string;
  appliesTo: UserRole;
  permissions: Record<string, string[]>;
  createdAt: string;
}

export interface UserAccessRecord {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  createdAt: string;
}

export interface DashboardPayload {
  plant: Plant;
  metrics: DashboardMetrics;
  equipment: Equipment[];
  alerts: Alert[];
  hourlyEnergy: EnergyPoint[];
  dailyEnergy: EnergyPoint[];
  maintenance: MaintenanceRecommendation[];
}

export interface DashboardData {
  plant: Plant;
  metrics: DashboardMetrics;
  equipment: Equipment[];
  alerts: Alert[];
  hourlyEnergy: EnergyPoint[];
  dailyEnergy: EnergyPoint[];
}
