'use client';

import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { className, error, id, label, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-mist/70">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={clsx(
            'w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 pr-12 text-white outline-none ring-0 placeholder:text-mist/35',
            error && 'border-danger/50',
            className
          )}
          {...props}
        />
        {/* Password visibility stays keyboard accessible via a real button with pressed state. */}
        <button
          type="button"
          className="absolute inset-y-0 right-2 inline-flex h-full items-center justify-center px-2 text-mist/55 transition hover:text-white focus-visible:text-white"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
});
