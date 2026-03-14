import clsx from 'clsx';

interface AppLogoProps {
  className?: string;
  compact?: boolean;
}

export function AppLogo({ className, compact = false }: AppLogoProps) {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={clsx('shrink-0', compact ? 'h-8 w-8' : 'h-10 w-10')}
      >
        <defs>
          <linearGradient id="plantpulse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1cc28a" />
            <stop offset="100%" stopColor="#f3a712" />
          </linearGradient>
          <linearGradient id="plantpulse-mark" x1="14" y1="12" x2="33" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dff8ef" />
            <stop offset="100%" stopColor="#9ce9cc" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#0b1622" stroke="url(#plantpulse-gradient)" strokeWidth="2" />
        <path
          d="M16 33V15h9.1c5.4 0 8.9 3 8.9 7.8 0 4.9-3.5 7.9-8.9 7.9h-4.3V33H16Zm4.8-6.3h3.7c2.8 0 4.5-1.4 4.5-3.9 0-2.4-1.7-3.8-4.5-3.8h-3.7v7.7Z"
          fill="url(#plantpulse-mark)"
        />
        <path
          d="M21 25.6h2.7l1.4-2.8 2.1 6 1.9-3.5H32"
          fill="none"
          stroke="#f3a712"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31.8 13.2c2.8-.3 5.1 1.7 5.4 4.5-2.8.3-5.1-1.7-5.4-4.5Z"
          fill="#1cc28a"
          stroke="#dff8ef"
          strokeWidth="0.8"
        />
      </svg>
      {!compact ? (
        <div>
          <p className="text-[11px] uppercase tracking-[0.38em] text-mist/58">Smart Plant Intelligence</p>
          <p className="text-lg font-semibold tracking-[-0.03em] text-white">PlantPulse AI</p>
        </div>
      ) : null}
    </div>
  );
}
