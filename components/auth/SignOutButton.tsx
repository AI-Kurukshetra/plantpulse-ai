'use client';

import { useState } from 'react';
import { LoaderCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { signOut } from '@/services/authService';

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);

    try {
      await signOut();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to fully sign out locally. Clearing server session.');
    } finally {
      // Server-side logout route is the source of truth for clearing auth cookies and redirecting to landing.
      window.location.assign('/auth/logout');
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="secondary" className="h-12 px-5" onClick={handleClick} disabled={pending}>
        <span className="inline-flex items-center gap-2">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {pending ? 'Signing out...' : 'Sign out'}
        </span>
      </Button>
      {error ? <p className="text-right text-xs text-danger">{error}</p> : null}
    </div>
  );
}
