import { redirect } from 'next/navigation';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Access',
  'Sign in to PlantPulse AI to access manufacturing intelligence, equipment analytics, and sustainability monitoring.'
);

export default function AuthPage() {
  redirect('/auth/login');
}
