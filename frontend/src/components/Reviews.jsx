import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../data/company';
import { Reveal, SectionHeading } from './Section';
import { TONES } from './Leadership';

export default function Reviews() {
  const trackRef = useRef(null);
  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });

  return (
    <section id="reviews" data-testid="section-reviews" className="bg-sand py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Traveller Stories"
            title="Journeys, In Their Words"
            sub="Notes shared with us by recent travellers — unedited, and honestly earned."
          />
          <Reveal delay={0.2} className="hidden shrink-0 gap-2.5 md:flex">
            <button data-testid="reviews-prev" onClick={() => scroll(-1)} aria-label="Previous reviews" className="rounded-full border border-ocean/20 bg-white p-3 text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <button data-testid="reviews-next" onClick={() => scroll(1)} aria-label="Next reviews" className="rounded-full border border-ocean/20 bg-white p-3 text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
              <ChevronRight size={18} />
            </button>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.12}>
        <div
          ref={trackRef}
          data-testid="reviews-track"
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {testimonials.map((t) => (
            <figure
              key={t.id}
              data-testid={`review-${t.id}`}
              className="flex w-[300px] shrink-0 snap-start flex-col justify-between rounded-3xl bg-white p-7 shadow-[0_10px_36px_rgba(6,24,43,0.07)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,24,43,0.13)] sm:w-[360px]"
            >
              <div>
                <Quote size={26} className="text-saffron/50" />
                <blockquote className="mt-4 font-editorial text-lg italic leading-relaxed text-ink/80">
                  "{t.text}"
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3.5 border-t border-dashed border-ocean/15 pt-5">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONES[t.tone]} font-display text-sm font-bold`}>
                  {t.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <span>
                  <span className="block font-body text-sm font-extrabold text-ocean">{t.name}</span>
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-ink/45">
                    {t.trip} · {t.date}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
