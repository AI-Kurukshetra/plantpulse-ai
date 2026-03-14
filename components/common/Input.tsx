import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, label, ...props },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-mist/70">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        className={clsx(
          'w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-white outline-none ring-0 placeholder:text-mist/35',
          error && 'border-danger/50',
          className
        )}
        {...props}
      />
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
});
