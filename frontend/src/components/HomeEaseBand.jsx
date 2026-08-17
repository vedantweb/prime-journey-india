import { ArrowUpRight, Home } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { Reveal } from './Section';

export default function HomeEaseBand() {
  const { sisterBrand } = siteConfig;
  return (
    <section data-testid="section-homeease" className="bg-white px-5 pb-24 sm:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ocean px-7 py-10 sm:px-12 sm:py-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-turq/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-saffron/15 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.35em] text-gold">
                <Home size={13} /> From our family
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
                Travel freely. <span className="font-editorial italic text-gold">Come home to comfort.</span>
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {sisterBrand.services.map((s) => (
                  <span key={s} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <a
              data-testid="homeease-cta"
              href={sisterBrand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-arrow group flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-body text-sm font-bold text-ocean transition-colors duration-300 hover:bg-gold hover:text-ocean-deep"
            >
              Explore {sisterBrand.name} <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
