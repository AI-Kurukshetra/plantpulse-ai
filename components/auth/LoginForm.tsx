'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoaderCircle, LogIn } from 'lucide-react';
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
      // Hard navigation avoids transient stale auth layouts after a successful sign-in.
      window.location.assign(getPostAuthRedirectPath(role));
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

          <p className="text-center text-sm text-mist/70">
            Need access?{' '}
            <Link href="/auth/signup" className="text-signal transition hover:text-[#4ad7aa]">
              Create account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
