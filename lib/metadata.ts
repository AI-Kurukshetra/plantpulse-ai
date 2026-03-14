import type { Metadata } from 'next';

const siteName = 'PlantPulse AI';
const baseDescription =
  'PlantPulse AI is a smart plant intelligence platform for OEE visibility, equipment health, energy consumption, emissions tracking, and alert management.';

export function createPageMetadata(title: string, description = baseDescription): Metadata {
  return {
    title: `${title} | ${siteName}`,
    description
  };
}

export const appMetadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: baseDescription
};
