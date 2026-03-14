'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPostAuthRedirectPath } from '@/lib/authRedirect';
import { loginSchema, type LoginValues } from '@/lib/validation/auth';
import { signIn } from '@/services/authService';
import type { UserRole } from '@/types';

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginValues) => {
    setPending(true);
    setMessage(null);

    try {
      const data = await signIn(values.email, values.password);
      const role = (data.user?.user_metadata?.role as UserRole | undefined) ?? (data.user?.app_metadata?.role as UserRole | undefined) ?? 'technician';
      router.replace(getPostAuthRedirectPath(role));
      router.refresh();
      return;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full border-white/12 bg-[#0b1622]/88">
      <CardHeader className="pb-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <LogIn className="h-5 w-5 text-signal" />
        </div>
        <CardTitle className="text-2xl">Sign in to PlantPulse AI</CardTitle>
        <CardDescription>
          Access live plant monitoring, predictive maintenance insights, and sustainability intelligence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="operator@plantpulse.ai"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />

          {message ? (
            <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-mist/88">{message}</p>
          ) : null}

          <Button type="submit" fullWidth disabled={pending} className="inline-flex items-center justify-center gap-2">
            {pending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </Button>

          {/* Signup CTA: visible card so new users can find account creation without hunting for a small link. */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <UserPlus className="h-5 w-5 text-signal" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">New to PlantPulse AI?</p>
                <p className="mt-0.5 text-sm text-mist/70">
                  Create an account to access dashboards, alerts, and sustainability analytics.
                </p>
              </div>
            </div>
            <Link
              href="/auth/signup"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-signal/50 bg-signal/10 px-4 py-3 font-medium text-signal transition hover:bg-signal/20 hover:text-[#4ad7aa]"
              aria-label="Go to sign up page"
            >
              <UserPlus className="h-4 w-4" />
              Create an account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
