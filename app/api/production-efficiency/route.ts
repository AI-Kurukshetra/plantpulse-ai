import { NextResponse } from 'next/server';
import { getProductionEfficiencyDashboardData } from '@/services/productionService';

export async function GET() {
  // Production efficiency data is sourced from Supabase equipment + production_units with fallback when unavailable.
  const data = await getProductionEfficiencyDashboardData();
  return NextResponse.json({
    records: data.records,
    trend: data.trend,
    aiInsights: data.aiInsights
  });
}
