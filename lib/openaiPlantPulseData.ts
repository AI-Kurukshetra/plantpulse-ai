import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import type { Alert, EnergyPoint, Equipment, Plant } from '@/types';

const equipmentStatusSchema = z.enum(['running', 'idle', 'maintenance', 'offline']);
const alertSeveritySchema = z.enum(['critical', 'warning', 'info']);

const snapshotSchema = z.object({
  plant: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    location: z.string().min(1),
    lineCount: z.number().int().min(1),
    targetOee: z.number().min(1).max(100),
    timezone: z.string().min(1)
  }),
  equipment: z.array(
    z.object({
      id: z.string().min(1),
      plantId: z.string().min(1),
      name: z.string().min(1),
      category: z.string().min(1),
      status: equipmentStatusSchema,
      temperature: z.number(),
      vibration: z.number(),
      runtimeHours: z.number().int().min(0),
      healthScore: z.number().min(0).max(100),
      serviceIntervalHours: z.number().int().min(1),
      lastServiceDate: z.string().min(1),
      energyKwh: z.number().min(0),
      emissionsKgCo2: z.number().min(0)
    })
  ),
  alerts: z.array(
    z.object({
      id: z.string().min(1),
      plantId: z.string().optional(),
      equipmentId: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      severity: alertSeveritySchema,
      createdAt: z.string().min(1),
      acknowledged: z.boolean(),
      source: z.string().optional()
    })
  ),
  hourlyEnergy: z.array(
    z.object({
      label: z.string().min(1),
      usageKwh: z.number().min(0),
      productionUnits: z.number().int().min(0),
      energyPerUnit: z.number().min(0)
    })
  ),
  dailyEnergy: z.array(
    z.object({
      label: z.string().min(1),
      usageKwh: z.number().min(0),
      productionUnits: z.number().int().min(0),
      energyPerUnit: z.number().min(0)
    })
  )
});

type SnapshotSchema = z.infer<typeof snapshotSchema>;

function extractResponseText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const maybeOutputText = (payload as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === 'string' && maybeOutputText.trim()) {
    return maybeOutputText;
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const part of content) {
      if (!part || typeof part !== 'object') {
        continue;
      }
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string' && text.trim()) {
        return text;
      }
    }
  }

  return null;
}

function mapSnapshot(schemaData: SnapshotSchema): {
  alerts: Alert[];
  dailyEnergy: EnergyPoint[];
  equipment: Equipment[];
  hourlyEnergy: EnergyPoint[];
  plant: Plant;
} {
  return {
    plant: schemaData.plant,
    equipment: schemaData.equipment,
    alerts: schemaData.alerts,
    hourlyEnergy: schemaData.hourlyEnergy,
    dailyEnergy: schemaData.dailyEnergy
  };
}

async function generatePlantPulseSnapshotFromOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.35,
        max_output_tokens: 1800,
        input: [
          {
            role: 'system',
            content:
              'You generate realistic industrial operations telemetry for a manufacturing intelligence dashboard. Return JSON only.'
          },
          {
            role: 'user',
            content:
              'Return an object with keys: plant, equipment, alerts, hourlyEnergy, dailyEnergy. Keep 1 plant, 6 equipment, 6 alerts max, 12 hourlyEnergy points and 7 dailyEnergy points. Equipment statuses must be running/idle/maintenance/offline. Alert severities must be critical/warning/info. Ensure numeric values are realistic and coherent for manufacturing. Use recent ISO timestamps for lastServiceDate/createdAt.'
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;
    const text = extractResponseText(payload);
    if (!text) {
      throw new Error('OpenAI response did not include readable JSON text.');
    }

    const parsed = snapshotSchema.parse(JSON.parse(text));
    return mapSnapshot(parsed);
  } finally {
    clearTimeout(timeout);
  }
}

// Cached AI fallback so dashboard list/table calls don't trigger repeated model requests.
export const getCachedOpenAISnapshot = unstable_cache(
  async () => generatePlantPulseSnapshotFromOpenAI(),
  ['plantpulse-openai-fallback'],
  { revalidate: 90 }
);
