'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { signOut } from '@/services/authService';

export function SignOutButton() {
  const router = useRouter();

  const handleClick = async () => {
    await signOut();
    router.replace('/auth');
    router.refresh();
  };

  return (
    <Button variant="secondary" className="h-12 px-5" onClick={handleClick}>
      Sign out
    </Button>
  );
}
