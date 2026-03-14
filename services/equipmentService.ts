import { enrichEquipmentData } from '@/lib/openaiEnrichment';
import type { Equipment } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { getPrimaryPlantRow, getFallbackEquipment, mapEquipmentRows, shouldUseFallback } from '@/services/serviceUtils';

export async function getEquipmentStatus(): Promise<Equipment[]> {
  if (shouldUseFallback()) {
    return await getFallbackEquipment();
  }

  const plantRow = await getPrimaryPlantRow();
  if (!plantRow) {
    return await getFallbackEquipment();
  }

  const { data: equipmentRows, error: equipmentError } = await supabase!
    .from('equipment')
    .select('*')
    .eq('plant_id', plantRow.id)
    .order('name', { ascending: true });

  if (equipmentError || !equipmentRows?.length) {
    return await getFallbackEquipment();
  }

  const equipmentIds = equipmentRows.map((row) => row.id);
  const { data: sensorRows } = await supabase!.from('sensors').select('*').in('equipment_id', equipmentIds);
  const sensorIds = sensorRows?.map((row) => row.id) ?? [];
  const { data: measurementRows } = sensorIds.length
    ? await supabase!
        .from('measurements')
        .select('*')
        .in('sensor_id', sensorIds)
        .order('recorded_at', { ascending: false })
        .limit(Math.max(sensorIds.length * 8, 24))
    : { data: [] as never[] };
  const { data: energyRows } = await supabase!
    .from('energy_consumption')
    .select('*')
    .eq('plant_id', plantRow.id)
    .order('measured_at', { ascending: false })
    .limit(Math.max(equipmentIds.length * 8, 24));
  const { data: emissionsRows } = await supabase!
    .from('emissions')
    .select('*')
    .eq('plant_id', plantRow.id)
    .order('measured_at', { ascending: false })
    .limit(Math.max(equipmentIds.length * 8, 24));

  const equipment = mapEquipmentRows(
    equipmentRows,
    sensorRows ?? [],
    measurementRows ?? [],
    energyRows ?? [],
    emissionsRows ?? []
  );

  // AI enrichment augments live Supabase equipment rows with predictive context.
  return enrichEquipmentData(
    {
      id: plantRow.id,
      name: plantRow.name,
      targetOee: Number(plantRow.target_oee)
    },
    equipment
  ).catch(() => equipment);
}
