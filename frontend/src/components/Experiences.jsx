import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { experiences } from '../data/experiences';
import { Reveal, SectionHeading } from './Section';

export default function Experiences() {
  const navigate = useNavigate();
  return (
    <section id="experiences" data-testid="section-experiences" className="overflow-hidden bg-ocean-deep py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            dark
            eyebrow="Moments"
            title="Experiences Worth Remembering"
            sub="Not just places — the hours inside them that stay with you. Tap any experience to explore the destination."
          />
          <Reveal delay={0.2} className="shrink-0">
            <p className="font-editorial text-xl italic text-gold/90">Collect moments, not checklists.</p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.1}>
        <div data-testid="experiences-track" className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          {experiences.map((e, i) => (
            <button
              key={e.id}
              data-testid={`experience-${e.id}`}
              onClick={() => navigate(`/destinations/${e.destId}`)}
              className="group relative h-[420px] w-[290px] shrink-0 snap-start overflow-hidden rounded-3xl text-left sm:h-[480px] sm:w-[350px]"
            >
              <img
                src={e.image}
                alt={e.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/90 via-ocean-deep/10 to-ocean-deep/20" />
              <span className="absolute left-5 top-5 font-display text-5xl font-bold text-white/25 transition-colors duration-500 group-hover:text-gold/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">{e.place}</p>
                <h3 className="mt-1.5 font-display text-2xl font-bold">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75 opacity-0 transition-[opacity,transform] duration-500 [transform:translateY(8px)] group-hover:opacity-100 group-hover:[transform:translateY(0)]">
                  {e.blurb}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-colors duration-300 group-hover:bg-saffron group-hover:text-ocean-deep">
                  Explore <ArrowRight size={13} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
