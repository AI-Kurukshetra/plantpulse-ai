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
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#0b1622" stroke="url(#plantpulse-gradient)" strokeWidth="2" />
        <path d="M15 31V17h5.5c4.8 0 7.5 2.4 7.5 6.6S25.3 31 20.5 31H15zm5.1-3.3c2.7 0 4.2-1.3 4.2-4.1s-1.5-4.1-4.2-4.1h-1.8v8.2h1.8z" fill="#dff8ef" />
        <circle cx="33.5" cy="15.5" r="3.2" fill="#f3a712" />
      </svg>
      {!compact ? (
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-mist/60">plantpulse-ai</p>
          <p className="font-mono text-lg font-semibold text-white">PlantPulse AI</p>
        </div>
      ) : null}
    </div>
  );
}
