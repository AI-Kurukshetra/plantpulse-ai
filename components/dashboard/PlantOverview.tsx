import type { Plant } from '@/types';

export function PlantOverview({ plant }: { plant: Plant }) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-mist/50">Plant profile</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{plant.name}</h3>
          <p className="mt-2 text-sm text-mist/70">
            {plant.location} • {plant.lineCount} production lines • OEE target {plant.targetOee}% • {plant.timezone ?? 'UTC'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-mist/50">Platform</p>
            <p className="mt-2 text-lg text-white">PlantPulse AI</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-mist/50">Carbon factor</p>
            <p className="mt-2 text-lg text-white">0.42 kg CO2/kWh</p>
          </div>
        </div>
      </div>

      {/* AI enrichment context is rendered only when available from service-layer enrichment. */}
      {plant.aiSummary || plant.sustainabilityContext ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {plant.aiSummary ? (
            <article className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-signal">AI summary</p>
              <p className="mt-2 text-sm text-mist/75">{plant.aiSummary}</p>
            </article>
          ) : null}
          {plant.sustainabilityContext ? (
            <article className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-amber">Sustainability context</p>
              <p className="mt-2 text-sm text-mist/75">{plant.sustainabilityContext}</p>
            </article>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
