import { NextResponse } from 'next/server';
import { getDailyEnergyConsumption, getHourlyEnergyConsumption } from '@/services/energyService';
import { getEquipmentStatus } from '@/services/equipmentService';

export async function GET() {
  // Data for this feature is sourced from Supabase energy_consumption and equipment telemetry via services.
  const [hourlyEnergy, dailyEnergy, equipment] = await Promise.all([
    getHourlyEnergyConsumption(),
    getDailyEnergyConsumption(),
    getEquipmentStatus()
  ]);

  return NextResponse.json({
    hourlyEnergy,
    dailyEnergy,
    equipment
  });
}
