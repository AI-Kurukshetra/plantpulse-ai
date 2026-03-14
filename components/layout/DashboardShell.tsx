'use client';

import { usePathname } from 'next/navigation';
import { AppLogo } from '@/components/common/AppLogo';
import { navigation } from '@/lib/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { getDashboardHeader } from '@/lib/dashboardTitles';
import type { UserRole } from '@/types';

interface DashboardShellProps {
  role: UserRole;
  children: React.ReactNode;
}

/**
 * Dashboard layout shell: sidebar + header always visible; only the content area (children) is
 * replaced by loading.tsx when a segment is loading. Keeps nav and header stable during fetches.
 */
export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const { title, subtitle } = getDashboardHeader(pathname);
  const allowedNavigation = navigation.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen grid-overlay bg-plant-grid">
      <div className="mx-auto flex min-h-screen w-full max-w-none gap-6 py-6 px-0">
        {/* Sidebar stays visible during loading; only main content shows skeleton. */}
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:flex-col lg:overflow-y-auto">
          <div className="shrink-0">
            <AppLogo />
            <p className="mt-2 text-sm text-mist/70">
              Smart plant intelligence for operations, equipment health, energy, and emissions oversight.
            </p>
          </div>
          <SidebarNav items={allowedNavigation} />
        </aside>

        <main className="flex-1 rounded-[30px] border border-white/10 bg-slate/60 p-5 shadow-panel backdrop-blur md:p-8">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <AppLogo compact className="mb-3 md:hidden" />
              <p className="text-xs uppercase tracking-[0.35em] text-signal">Live plant intelligence</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-mist/75">{subtitle}</p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-mist/55">Plant window</p>
                <p className="mt-1 text-lg font-medium text-white">Shift A / 06:00 - 14:00</p>
              </div>
              <div className="md:self-stretch">
                <SignOutButton />
              </div>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
