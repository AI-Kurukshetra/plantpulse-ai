'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoaderCircle, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PasswordField } from '@/components/auth/PasswordField';
import { Select } from '@/components/common/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPostAuthRedirectPath } from '@/lib/authRedirect';
import { signupSchema, type SignupValues } from '@/lib/validation/auth';
import { SignupRateLimitError, signUp } from '@/services/authService';
import type { UserRole } from '@/types';

export function SignupForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [rateLimitState, setRateLimitState] = useState<SignupValues | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      role: 'technician'
    }
  });

  const submitSignup = async (values: SignupValues) => {
    setPending(true);
    setMessage(null);
    setRateLimitState(null);

    try {
      // Public signup is enabled for non-admin roles.
      const data = await signUp(values.email, values.password, values.role, { fullName: values.fullName });
      const role = (data.user?.user_metadata?.role as UserRole | undefined) ?? values.role;
      router.replace(getPostAuthRedirectPath(role));
      router.refresh();
      return;
    } catch (error) {
      if (error instanceof SignupRateLimitError) {
        setRateLimitState(values);
      }
      setMessage(error instanceof Error ? error.message : 'Unable to complete signup.');
    } finally {
      setPending(false);
    }
  };

  const onSubmit = handleSubmit(submitSignup);

  return (
    <Card className="w-full border-white/12 bg-[#0b1622]/88">
      <CardHeader className="pb-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <UserPlus className="h-5 w-5 text-signal" />
        </div>
        <CardTitle className="text-2xl">Create your PlantPulse AI account</CardTitle>
        <CardDescription>Sign up to access dashboards, alerts, and sustainability analytics.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Alex Kumar"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            id="email"
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="operator@plantpulse.ai"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            id="role"
            label="Role"
            options={[
              { label: 'Technician', value: 'technician' },
              { label: 'Plant Manager', value: 'plant_manager' }
            ]}
            {...register('role')}
          />
          <PasswordField
            id="password"
            autoComplete="new-password"
            label="Password"
            placeholder="Enter a password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            label="Confirm password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {message ? (
            <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-mist/88">{message}</p>
          ) : null}

          {rateLimitState ? (
            <div className="rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm text-mist/88">
              <p className="font-medium text-white">Signup is being throttled by the email provider.</p>
              <p className="mt-1 text-mist/78">
                Retry in a few seconds, or continue to login if the account was already created.
              </p>
              {/* Rate-limit handling keeps users moving with retry and login fallback instead of a dead-end error. */}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  className="justify-center"
                  disabled={pending}
                  onClick={() => void submitSignup(rateLimitState)}
                >
                  Retry signup
                </Button>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10"
                >
                  Continue to login
                </Link>
              </div>
            </div>
          ) : null}

          <Button type="submit" fullWidth disabled={pending} className="inline-flex items-center justify-center gap-2">
            {pending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign up'
            )}
          </Button>
          <p className="text-center text-sm text-mist/70">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-signal hover:text-[#4ad7aa]">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
