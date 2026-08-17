import { useState } from 'react';
import { assets } from '../data/siteConfig';
import { TONES } from './Leadership';

// Single-image-source renderer: uses the centralized asset map (public/assets/*).
// Until the real uploaded files exist, it gracefully falls back to a monogram.
export default function PersonImage({ imageKey, initials, tone = 'ocean', className = '', size = 'h-24 w-24', text = 'text-2xl', testid, rounded = 'rounded-full' }) {
  const [err, setErr] = useState(false);
  const src = assets[imageKey];
  if (src && !err) {
    return (
      <img
        src={src}
        alt={initials}
        data-testid={testid}
        onError={() => setErr(true)}
        className={`${size} ${rounded} object-cover object-top shadow-[0_12px_30px_rgba(6,24,43,0.18)] ring-4 ring-white ${className}`}
      />
    );
  }
  return (
    <span
      data-testid={testid}
      className={`flex ${size} ${rounded} items-center justify-center ${TONES[tone]} font-display ${text} font-bold shadow-[0_12px_30px_rgba(6,24,43,0.18)] ring-4 ring-white ${className}`}
    >
      {initials}
    </span>
  );
}
