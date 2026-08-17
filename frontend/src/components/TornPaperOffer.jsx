import PriceCounter, { inr } from './PriceCounter';
import { tornOffer } from '../data/packages';
import { useUI } from '../context/UIContext';
import { Reveal } from './Section';
import { ArrowRight } from 'lucide-react';

export default function TornPaperOffer() {
  const { openBooking } = useUI();
  return (
    <section data-testid="section-offer" className="relative overflow-hidden py-24 sm:py-32">
      <img src={tornOffer.image} alt={tornOffer.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ocean-deep/85 via-ocean-deep/55 to-ocean-deep/25" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <Reveal className="max-w-md">
          <p className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-9 bg-gold" /> Season Campaign
          </p>
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            This season, the valley is calling.
          </h2>
          <p className="mt-4 text-base text-white/75 md:text-lg">
            Handpicked houseboats, snow-day excursions and slow shikara evenings — bundled into one limited season price.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="w-full max-w-xl">
          <div className="relative rotate-[-2deg]">
            <div className="absolute -left-3 top-6 z-10 h-8 w-24 rotate-[-38deg] rounded-sm bg-sand/70 shadow-sm backdrop-blur-[1px]" aria-hidden="true" />
            <div className="absolute -right-4 top-10 z-10 h-8 w-24 rotate-[32deg] rounded-sm bg-sand/70 shadow-sm backdrop-blur-[1px]" aria-hidden="true" />
            <div data-testid="torn-paper-offer" className="torn-paper relative px-8 py-12 text-center sm:px-14 sm:py-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-coral">{tornOffer.kicker}</p>
              <h3 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-ocean sm:text-5xl">
                {tornOffer.title}
              </h3>
              <div className="mt-6 flex items-end justify-center gap-4">
                <span data-testid="offer-price-from" className="pb-2 text-lg font-semibold text-ink/40 line-through decoration-coral decoration-2">
                  {inr(tornOffer.priceFrom)}
                </span>
                <PriceCounter
                  from={tornOffer.priceFrom}
                  to={tornOffer.priceTo}
                  testid="offer-price-counter"
                  className="font-display text-5xl font-extrabold tracking-tight text-saffron sm:text-6xl"
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink/60">
                {tornOffer.duration} · per person
              </p>
              <button
                data-testid="offer-cta"
                onClick={() => openBooking('Kashmir Escape')}
                className="btn-arrow group mx-auto mt-8 flex items-center gap-2 rounded-full bg-ocean px-8 py-3.5 font-display text-sm font-bold text-white transition-colors duration-300 hover:bg-saffron hover:text-ocean-deep"
              >
                Claim This Journey <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
