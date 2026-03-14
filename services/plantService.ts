import { enrichPlantData } from '@/lib/openaiEnrichment';
import type { Plant } from '@/types';
import { getPrimaryPlantRow, getFallbackPlant, mapPlant, shouldUseFallback } from '@/services/serviceUtils';

export async function getPrimaryPlant(): Promise<Plant> {
  if (shouldUseFallback()) {
    return await getFallbackPlant();
  }

  const plantRow = await getPrimaryPlantRow();
  if (!plantRow) {
    return await getFallbackPlant();
  }

  const plant = mapPlant(plantRow);
  // AI enrichment adds contextual plant narrative while preserving base Supabase fields.
  return enrichPlantData(plant).catch(() => plant);
}

export async function getPlantSummary() {
  const plant = await getPrimaryPlant();

  return {
    plant,
    metrics: {
      oee: plant.targetOee,
      throughput: 0,
      activeAlerts: 0,
      equipmentOnline: 0,
      totalEquipment: 0,
      totalEnergyKwh: 0,
      emissionsKgCo2: 0
    },
    alerts: []
  };
}
