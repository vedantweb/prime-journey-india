import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { Reveal, SectionHeading } from './Section';

const SPANS = {
  large: 'md:col-span-7 md:row-span-2 h-[300px] md:h-[560px]',
  tall: 'md:col-span-5 md:row-span-2 h-[300px] md:h-[560px]',
  wide: 'md:col-span-7 h-[260px] md:h-[264px]',
  square: 'md:col-span-5 h-[260px] md:h-[264px]',
};

export default function DiscoverIndia() {
  const navigate = useNavigate();
  return (
    <section id="destinations" data-testid="section-destinations" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Destinations"
            title={<>Discover <span className="font-editorial font-semibold italic text-saffron">India</span></>}
            sub="Eight corners of the country we know by heart — each with its own light, flavour and pace."
          />
          <Reveal delay={0.2} className="shrink-0">
            <p className="max-w-[240px] font-editorial text-xl italic leading-snug text-ink/50 md:text-right">
              "Every journey has a story."
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 md:auto-rows-min">
          {destinations.map((d, i) => (
            <Reveal key={d.id} delay={(i % 4) * 0.08} className={`${SPANS[d.size]} md:col-span-auto`}>
              <button
                data-testid={`destination-${d.id}`}
                onClick={() => navigate(`/destinations/${d.id}`)}
                className="img-hover-zoom group relative block h-full w-full overflow-hidden rounded-3xl text-left"
              >
                <img src={d.image} alt={d.alt} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/75 via-ocean-deep/5 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">{d.name}</h3>
                    <p className="mt-1 font-editorial text-base italic text-white/80 opacity-0 transition-[opacity,transform] duration-500 [transform:translateY(6px)] group-hover:opacity-100 group-hover:[transform:translateY(0)]">
                      {d.tagline}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-saffron group-hover:text-ocean-deep">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
