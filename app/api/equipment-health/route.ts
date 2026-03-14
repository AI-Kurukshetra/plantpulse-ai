import { NextResponse } from 'next/server';
import { getAlerts } from '@/services/alertsService';
import { getEquipmentStatus } from '@/services/equipmentService';

export async function GET() {
  // Equipment health payload uses live equipment + alerts services (Supabase + AI enrichment aware).
  const [equipment, alerts] = await Promise.all([getEquipmentStatus(), getAlerts(20)]);

  return NextResponse.json({
    alerts,
    equipment
  });
}
