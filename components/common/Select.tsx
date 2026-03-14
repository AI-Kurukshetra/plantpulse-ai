import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, id, label, options, ...props },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-mist/70">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        className={clsx(
          'w-full rounded-2xl border border-white/10 bg-ink/60 px-4 py-3 text-white outline-none',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});
