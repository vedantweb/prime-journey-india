export default function Logo({ dark = false, compact = false }) {
  return (
    <span className="flex items-center gap-2.5" data-testid="brand-logo">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-saffron via-coral to-gold font-display text-sm font-800 font-extrabold text-white shadow-md">
        PJ
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={`block font-display text-[15px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ocean'}`}>
            Prime Journey India
          </span>
          <span className={`mt-0.5 block font-editorial text-[11px] italic ${dark ? 'text-gold' : 'text-saffron'}`}>
            India, Your Way.
          </span>
        </span>
      )}
    </span>
  );
}
