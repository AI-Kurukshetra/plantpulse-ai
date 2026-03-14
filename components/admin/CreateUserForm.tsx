'use client';

import { useState } from 'react';
import { LoaderCircle, UserRoundPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { createUserSchema, type CreateUserValues } from '@/lib/validation/auth';

interface CreateUserFormProps {
  embedded?: boolean;
  onCreated?: () => void;
}

export function CreateUserForm({ embedded = false, onCreated }: CreateUserFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      role: 'technician'
    }
  });

  const onSubmit = async (values: CreateUserValues) => {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to create user.');
      }

      setMessage('User created successfully.');
      reset({
        email: '',
        fullName: '',
        password: '',
        role: 'technician'
      });
      onCreated?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create user.');
    } finally {
      setPending(false);
    }
  };

  const form = (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="adminCreateFullName"
        label="Full name"
        placeholder="Priya Sharma"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        id="adminCreateEmail"
        label="Email"
        type="email"
        placeholder="team.member@plantpulse.ai"
        error={errors.email?.message}
        {...register('email')}
      />
      <Select
        id="adminCreateRole"
        label="Role"
        options={[
          { label: 'Technician', value: 'technician' },
          { label: 'Plant Manager', value: 'plant_manager' },
          { label: 'Admin', value: 'admin' }
        ]}
        {...register('role')}
      />
      <Input
        id="adminCreatePassword"
        label="Temporary password"
        type="password"
        placeholder="At least 6 characters"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending} className="inline-flex items-center gap-2">
          {pending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserRoundPlus className="h-4 w-4" />
              Create user
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (embedded) {
    return (
      <>
        {form}
        {message ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist/85">{message}</p>
        ) : null}
      </>
    );
  }

  return (
    <section className="rounded-[26px] border border-white/10 bg-ink/50 p-5">
      <div className="mb-5">
        <p className="text-lg font-medium text-white">Create User</p>
        <p className="mt-1 text-sm text-mist/65">
          Admin-only user provisioning supports technician, plant manager, and admin roles.
        </p>
      </div>

      {form}
      {message ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist/85">{message}</p>
      ) : null}
    </section>
  );
}
