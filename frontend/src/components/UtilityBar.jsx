import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function UtilityBar() {
  return (
    <div data-testid="utility-bar" className="relative z-50 bg-ocean text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] sm:px-6 sm:text-xs">
        <a
          data-testid="link-prime-homeease"
          href={siteConfig.sisterBrand.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 font-semibold tracking-wide text-gold transition-colors duration-200 hover:text-saffron"
        >
          <span className="hidden h-1.5 w-1.5 rounded-full bg-gold sm:block" />
          {siteConfig.sisterBrand.name}
          <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <div className="flex items-center gap-3 sm:gap-5">
          <a data-testid="link-phone-top" href={siteConfig.phoneHref} className="flex items-center gap-1.5 transition-colors duration-200 hover:text-gold">
            <Phone size={12} />
            <span className="hidden sm:inline">{siteConfig.phone}</span>
          </a>
          <a data-testid="link-email-top" href={`mailto:${siteConfig.email}`} className="hidden items-center gap-1.5 transition-colors duration-200 hover:text-gold md:flex">
            <Mail size={12} />
            {siteConfig.email}
          </a>
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Language</span>
            <select
              data-testid="select-language"
              defaultValue="English"
              className="cursor-pointer appearance-none bg-transparent text-[11px] font-medium outline-none transition-colors duration-200 hover:text-gold sm:text-xs"
            >
              {siteConfig.languages.map((l) => (
                <option key={l} value={l} className="text-ocean">
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
