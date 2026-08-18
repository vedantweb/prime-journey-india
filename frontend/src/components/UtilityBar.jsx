import { Link } from 'react-router-dom';
import { ArrowUpRight, PhoneCall } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function UtilityBar() {
  return (
    <div className="flex h-11 w-full items-center justify-between bg-ocean-deep px-4 sm:px-7 lg:px-8 text-[13px] text-white/90">
      <a
        href={siteConfig.sisterBrand.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 font-body font-semibold transition-colors hover:text-white"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        {siteConfig.sisterBrand.name}
        <ArrowUpRight size={12} strokeWidth={1.8} className="text-gold" />
      </a>

      <Link
        to="/contact"
        className="flex items-center gap-1.5 font-body font-semibold transition-colors hover:text-white"
      >
        <PhoneCall size={17} strokeWidth={1.9} className="text-gold" />
        Contact Us
      </Link>
    </div>
  );
}
