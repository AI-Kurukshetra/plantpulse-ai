import { enrichAlertsData } from '@/lib/openaiEnrichment';
import type { Alert } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { getPrimaryPlantRow, getFallbackAlerts, mapAlert, shouldUseFallback } from '@/services/serviceUtils';

export async function getAlerts(limit = 6): Promise<Alert[]> {
  if (shouldUseFallback()) {
    const alerts = await getFallbackAlerts();
    return alerts.slice(0, limit);
  }

  const plantRow = await getPrimaryPlantRow();
  if (!plantRow) {
    const alerts = await getFallbackAlerts();
    return alerts.slice(0, limit);
  }

  const { data, error } = await supabase!
    .from('alerts')
    .select('*')
    .eq('plant_id', plantRow.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    const alerts = await getFallbackAlerts();
    return alerts.slice(0, limit);
  }

  const mapped = data.map(mapAlert);
  // AI enrichment appends triage context and optional synthetic risk alerts on top of live alert rows.
  const enriched = await enrichAlertsData(plantRow.id, mapped).catch(() => mapped);
  return enriched
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
