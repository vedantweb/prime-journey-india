import { ArrowUpRight } from 'lucide-react';
import { travelStyles } from '../data/experiences';
import { Reveal, SectionHeading } from './Section';
import { scrollToId } from './Header';

const SPANS = [
  'md:col-span-2 md:row-span-2 h-[280px] md:h-[420px]',
  'h-[280px] md:h-[200px]',
  'h-[280px] md:h-[200px]',
  'md:row-span-2 h-[280px] md:h-[420px]',
  'h-[280px] md:h-[200px]',
  'md:col-span-2 h-[280px] md:h-[200px]',
  'h-[280px] md:h-[200px]',
  'h-[280px] md:h-[200px]',
];

export default function TravelStyles() {
  return (
    <section id="holidays" data-testid="section-holidays" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Holidays"
          title="Travel Your Way"
          sub="Honeymoons and family summers, luxury escapes and spontaneous weekends — pick a mood, we'll build the journey."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-min">
          {travelStyles.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 0.07} className={SPANS[i % SPANS.length]}>
              <button
                data-testid={`style-${s.id}`}
                onClick={() => scrollToId('customize')}
                className="img-hover-zoom group relative block h-full w-full overflow-hidden rounded-3xl text-left"
              >
                <img src={s.image} alt={s.alt} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-extrabold text-white">{s.label}</h3>
                    <ArrowUpRight size={16} className="shrink-0 text-gold opacity-0 transition-[opacity,transform] duration-400 [transform:translate(-4px,4px)] group-hover:opacity-100 group-hover:[transform:translate(0,0)]" />
                  </div>
                  <p className="mt-1 max-h-0 overflow-hidden text-[13px] text-white/80 transition-[max-height,opacity] duration-500 group-hover:max-h-16 group-hover:opacity-100 md:opacity-0">
                    {s.line}
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
