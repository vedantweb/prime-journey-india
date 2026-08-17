import { useState } from 'react';
import { assets } from '../data/siteConfig';

export default function Logo({ dark = false, compact = false }) {
  const [err, setErr] = useState(false);
  return (
    <span className="flex items-center gap-2.5" data-testid="brand-logo">
      {err ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-saffron via-coral to-gold font-display text-sm font-bold text-white shadow-md">
          PJ
        </span>
      ) : (
        <img
          src={assets.logo}
          alt="Prime Journey India"
          onError={() => setErr(true)}
          className="h-9 w-9 rounded-full object-cover shadow-md"
        />
      )}
      {!compact && (
        <span className="leading-none">
          <span className={`block font-display text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-ocean'}`}>
            Prime Journey India
          </span>
          <span className={`mt-0.5 block font-editorial text-[13px] italic ${dark ? 'text-gold' : 'text-saffron'}`}>
            India, Your Way.
          </span>
        </span>
      )}
    </span>
  );
}
