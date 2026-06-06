type TanjaMallLogoProps = {
  compact?: boolean;
  iconOnly?: boolean;
  subtitle?: string;
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function TanjaMallLogo({
  compact = false,
  iconOnly = false,
  subtitle,
  className = '',
  markClassName = '',
  textClassName = '',
}: TanjaMallLogoProps) {
  return (
    <span className={`tm-logo inline-flex min-w-0 items-center gap-3 ${className}`} aria-label="TanjaMall">
      <span className={`tm-logo-mark grid shrink-0 place-items-center ${compact ? 'h-10 w-10' : 'h-11 w-11'} ${markClassName}`}>
        <svg viewBox="0 0 48 48" role="img" aria-hidden="true" className="h-full w-full">
          <rect width="48" height="48" rx="10" fill="#ff9900" />
          <path d="M13 14h22v6h-8v18h-6V20h-8V14Z" fill="#131921" />
          <path d="M13 31c5.4 4.7 16.2 4.7 22 0" fill="none" stroke="#fffdf8" strokeLinecap="round" strokeWidth="3.6" />
          <circle cx="37" cy="16" r="3" fill="#fffdf8" />
        </svg>
      </span>
      {!iconOnly ? (
        <span className={`min-w-0 ${compact ? 'hidden sm:block' : ''} ${textClassName}`}>
          <span className="tm-logo-wordmark block whitespace-nowrap font-heading font-black leading-none">
            Tanja<span className="tm-logo-accent">Mall</span>
          </span>
          {subtitle ? <span className="mt-1 block truncate text-xs font-bold opacity-70">{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
