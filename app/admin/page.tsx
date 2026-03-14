import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Admin',
  'PlantPulse AI administrative workspace for provisioning, policy review, and system oversight.'
);

export default async function AdminPage() {
  const role = await getCurrentRole();

  return (
    <AppShell
      title="Administrative Control Center"
      subtitle="Admin access is reserved for seeded platform operators. Use this area for provisioning and governance tasks."
      role={role}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.35em] text-signal">Provisioning</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Seeded admin only</h3>
          <p className="mt-3 text-sm text-mist/75">
            Admin accounts are created through the seed script and blocked from public signup.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.35em] text-signal">Auth model</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Supabase Auth + profiles</h3>
          <p className="mt-3 text-sm text-mist/75">
            Identity now lives in <code>auth.users</code>, with profile and role linkage stored in the public schema.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-panel">
          <p className="text-xs uppercase tracking-[0.35em] text-signal">Route guard</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Middleware enforced</h3>
          <p className="mt-3 text-sm text-mist/75">
            The <code>/admin</code> route now validates a live Supabase session and requires the admin role.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
