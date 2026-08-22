import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CloudRain, Snowflake, Sun } from 'lucide-react';
import { seasons } from '../data/packages';
import usePackagePrices from '../hooks/usePackagePrices';
import { EffectLayer } from './effects/EnvironmentEffects';
import { SectionHeading, Reveal } from './Section';
import { useUI } from '../context/UIContext';

const ICONS = { winter: Snowflake, summer: Sun, monsoon: CloudRain };

export default function SeasonExplorer() {
  const [active, setActive] = useState('winter');
  const season = seasons[active];
  const navigate = useNavigate();
  const { openBooking } = useUI();
  const packages = usePackagePrices();

  return (
    <section id="seasons" data-testid="section-seasons" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Season Explorer"
          title="Where Should You Go This Season?"
          sub="Pick a season — we'll change the weather, the destinations and the journeys to match."
          align="center"
        />

        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <div data-testid="season-tabs" className="inline-flex rounded-full border border-ocean/10 bg-cloud p-1.5">
            {Object.entries(seasons).map(([key, s]) => {
              const Icon = ICONS[key];
              const isActive = key === active;
              return (
                <button
                  key={key}
                  data-testid={`season-tab-${key}`}
                  onClick={() => setActive(key)}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-bold transition-colors duration-300 sm:px-7 ${
                    isActive ? 'text-white' : 'text-ocean/60 hover:text-ocean'
                  }`}
                >
                  {isActive && (
                    <motion.span layoutId="season-pill" className="absolute inset-0 rounded-full bg-ocean" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon size={15} /> {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 lg:grid-cols-2"
            >
              <div className="relative h-[340px] overflow-hidden rounded-3xl sm:h-[440px]">
                <img src={season.image} alt={season.alt} className="h-full w-full object-cover" />
                <EffectLayer effects={[season.effect]} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ocean-deep/75 to-transparent p-7 pt-20">
                  <p data-testid="season-mood" className="max-w-md font-editorial text-2xl italic text-white">
                    "{season.mood}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-8">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-turq">Best in {season.label}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {season.destinations.map((d) => (
                      <button
                        key={d.name}
                        data-testid={`season-dest-${d.name.toLowerCase()}`}
                        onClick={() => navigate(`/destinations/${d.destId}`)}
                        className="flex items-center gap-2.5 rounded-full border border-ocean/10 bg-cloud py-1.5 pl-1.5 pr-4 text-sm font-bold text-ocean transition-[border-color,box-shadow] duration-300 hover:border-saffron hover:shadow-[0_8px_20px_rgba(255,153,51,0.2)]"
                      >
                        <img src={d.image} alt={d.name} loading="lazy" className="h-9 w-9 rounded-full object-cover" />
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {season.packageIds.map((id) => {
                    const pkg = packages.find((p) => p.id === id);
                    if (!pkg) return null;
                    return (
                      <button
                        key={id}
                        data-testid={`season-package-${id}`}
                        onClick={() => openBooking(pkg.name)}
                        className="group flex items-center gap-4 rounded-2xl border border-ocean/10 bg-white p-3.5 text-left shadow-[0_6px_24px_rgba(6,24,43,0.06)] transition-[box-shadow,border-color] duration-300 hover:border-saffron/60 hover:shadow-[0_14px_36px_rgba(6,24,43,0.12)]"
                      >
                        <img src={pkg.image} alt={pkg.alt} loading="lazy" className="h-16 w-20 rounded-xl object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-lg font-bold text-ocean">{pkg.name}</span>
                          <span className="block text-xs font-medium text-ink/55">{pkg.duration}</span>
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-ocean/5 px-4 py-2 text-xs font-bold text-ocean transition-colors duration-300 group-hover:bg-saffron group-hover:text-ocean-deep">
                          Get Price <ArrowRight size={13} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
