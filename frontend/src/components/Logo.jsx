import { useState } from 'react';
import { assets } from '../data/siteConfig';

export default function Logo({ dark = false, compact = false }) {
  const [err, setErr] = useState(false);
  return (
    <span className="flex items-center gap-3" data-testid="brand-logo">
      {err ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-saffron via-coral to-gold font-display text-base font-bold text-white shadow-md">
          PJ
        </span>
      ) : (
        <img
          src={assets.logo}
          alt="PRIME JOURNEY INDIA"
          onError={() => setErr(true)}
          className="h-14 w-14 rounded-full object-cover shadow-md"
        />
      )}
      {!compact && (
        <span className="leading-none">
          <span className={`block uppercase font-[Montserrat] text-[14px] font-extrabold tracking-[0.02em] sm:text-[20px]`}>
            PRIME JOURNEY INDIA
          </span>
          <span className={`mt-0.5 hidden sm:block font-editorial text-[15px] italic ${dark ? 'text-gold' : 'text-saffron'}`}>
            India, Your Way.
          </span>
        </span>
      )}
    </span>
  );
}
