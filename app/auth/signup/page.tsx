import { redirect } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { SignupForm } from '@/components/auth/SignupForm';
import { getCurrentUser } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Sign Up',
  'Create your PlantPulse AI account and access plant analytics, alerts, and AI insights.'
);

export default async function AuthSignupPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect('/dashboard');
  }

  return (
    <AuthPageShell
      title="Create access for your plant operations team."
      description="Use PlantPulse AI to centralize monitoring, predictive maintenance, and sustainability insights."
      form={<SignupForm />}
    />
  );
}
