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
        <img src="/logo-variants/tanjamall-icon-12-uppercase-t-closer-smile.svg" alt="" aria-hidden="true" className="h-full w-full" />
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
