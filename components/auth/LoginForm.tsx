'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, LoaderCircle, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PasswordField } from '@/components/auth/PasswordField';
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

          <PasswordField
            id="password"
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

          {/* Signup CTA is presented as a richer conversion panel so the create-account path feels intentional. */}
          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(28,194,138,0.12),rgba(8,20,31,0.96)_34%,rgba(243,167,18,0.08))]">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-signal/25 bg-signal/10">
                  <Sparkles className="h-5 w-5 text-signal" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-signal/80">New workspace</p>
                  <p className="mt-1 text-lg font-semibold text-white">Set up a PlantPulse AI account</p>
                  <p className="mt-1 text-sm text-mist/72">
                    Start with live plant visibility, predictive maintenance context, and sustainability intelligence.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/50">Monitoring</p>
                <p className="mt-2 text-sm text-white">Centralized KPIs, equipment health, and alert visibility.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/50">AI Insights</p>
                <p className="mt-2 text-sm text-white">Actionable recommendations layered on live plant data.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-mist/50">Sustainability</p>
                <p className="mt-2 text-sm text-white">Track energy, emissions, and efficiency from day one.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-mist/70">
                <UserPlus className="h-4 w-4 text-signal" />
                Technician and Plant Manager signup supported
              </div>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-signal/45 bg-signal/12 px-5 py-3 font-medium text-signal transition hover:bg-signal/22 hover:text-[#4ad7aa]"
                aria-label="Go to sign up page"
              >
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
