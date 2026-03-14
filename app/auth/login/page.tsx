import { redirect } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { LoginForm } from '@/components/auth/LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Login',
  'Sign in to PlantPulse AI and access manufacturing intelligence dashboards and operational analytics.'
);

export default async function AuthLoginPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect('/dashboard');
  }

  return (
    <AuthPageShell
      mode="login"
      title="Smart plant intelligence for modern manufacturing teams."
      description="AI-powered manufacturing intelligence and sustainability monitoring platform."
      form={<LoginForm />}
    />
  );
}
