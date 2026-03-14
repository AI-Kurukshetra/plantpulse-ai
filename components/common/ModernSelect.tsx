'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface ModernSelectOption {
  label: string;
  value: string;
}

interface ModernSelectProps {
  className?: string;
  label?: string;
  onChange: (value: string) => void;
  options: ModernSelectOption[];
  value: string;
}

export function ModernSelect({ className, label, onChange, options, value }: ModernSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={clsx('relative', className)}>
      {label ? <p className="mb-2 text-xs uppercase tracking-[0.2em] text-mist/55">{label}</p> : null}
      {/* Custom select avoids native select spacing inconsistencies for selected values. */}
      <button
        type="button"
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-white/10 bg-ink/60 px-3 text-sm text-white"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown className={clsx('h-4 w-4 text-mist/60 transition', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.35rem)] z-30 w-full rounded-2xl border border-white/10 bg-[#0c1a28] p-1 shadow-panel">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-mist/80 transition hover:bg-white/5 hover:text-white"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value ? <Check className="h-4 w-4 text-signal" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
