'use client';

import { useRouter } from 'next/navigation';
import { LogIn, Sparkles, UserPlus } from 'lucide-react';

interface AuthHeaderActionProps {
  mode: 'login' | 'signup';
}

export function AuthHeaderAction({ mode }: AuthHeaderActionProps) {
  const router = useRouter();
  const isLoginMode = mode === 'login';

  return (
    <button
      type="button"
      onClick={() => router.push(isLoginMode ? '/auth/signup' : '/auth/login')}
      className="group inline-flex min-w-[208px] items-center gap-3 rounded-[20px] border border-signal/35 bg-[linear-gradient(135deg,rgba(28,194,138,0.16),rgba(243,167,18,0.08))] px-4 py-2.5 text-left transition hover:bg-[linear-gradient(135deg,rgba(28,194,138,0.22),rgba(243,167,18,0.14))]"
      aria-label={isLoginMode ? 'Open sign up page' : 'Open login page'}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-signal/25 bg-signal/10 text-signal transition group-hover:scale-[1.03]">
        {isLoginMode ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.26em] text-signal/80">
          <Sparkles className="h-3 w-3" />
          {isLoginMode ? 'New Account' : 'Quick Access'}
        </span>
        <span className="mt-1 block text-sm font-medium text-white">
          {isLoginMode ? 'Start signup' : 'Return to login'}
        </span>
      </span>
    </button>
  );
}
