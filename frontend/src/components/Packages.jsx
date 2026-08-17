import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { packages } from '../data/packages';
import PriceCounter, { inr } from './PriceCounter';
import { Reveal, SectionHeading } from './Section';
import { useUI } from '../context/UIContext';

function PackageCard({ pkg, onOpen, onBook }) {
  return (
    <article
      data-testid={`package-card-${pkg.id}`}
      onClick={() => onOpen(pkg)}
      className="group relative w-[300px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_rgba(6,24,43,0.08)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(6,24,43,0.16)] sm:w-[360px]"
    >
      <div className="img-hover-zoom relative h-52 overflow-hidden sm:h-56">
        <img src={pkg.image} alt={pkg.alt} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-ocean-deep/70 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
          <Clock size={12} /> {pkg.duration}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-saffron px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ocean-deep">
          Save {inr(pkg.priceFrom - pkg.priceTo)}
        </span>
      </div>
      <div className="p-6">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-turq">
          <MapPin size={12} /> {pkg.destination}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold text-ocean">{pkg.name}</h3>
        <p className="mt-1 text-[13px] font-medium text-ink/55">{pkg.route}</p>
        <div className="mt-5 flex items-end justify-between border-t border-dashed border-ocean/15 pt-4">
          <div>
            <span className="block text-xs font-semibold text-ink/45 line-through">{inr(pkg.priceFrom)}</span>
            <PriceCounter
              from={pkg.priceFrom}
              to={pkg.priceTo}
              testid={`package-price-${pkg.id}`}
              className="font-body text-2xl font-extrabold text-ocean"
            />
            <span className="block text-[11px] font-medium text-ink/45">per person onwards</span>
          </div>
        </div>
        <div className="mt-5 flex gap-2.5">
          <button
            data-testid={`package-details-${pkg.id}`}
            onClick={(e) => { e.stopPropagation(); onOpen(pkg); }}
            className="flex-1 rounded-full border border-ocean/20 px-4 py-2.5 text-[13px] font-bold text-ocean transition-colors duration-300 hover:border-ocean hover:bg-ocean hover:text-white"
          >
            View Details
          </button>
          <button
            data-testid={`package-book-${pkg.id}`}
            onClick={(e) => { e.stopPropagation(); onBook(pkg); }}
            className="btn-arrow group/btn flex flex-1 items-center justify-center gap-1.5 rounded-full bg-saffron px-4 py-2.5 text-[13px] font-bold text-ocean-deep transition-colors duration-300 hover:bg-coral hover:text-white"
          >
            Book Now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Packages() {
  const { openBooking } = useUI();
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });

  return (
    <section id="packages" data-testid="section-packages" className="relative bg-cloud py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Handcrafted Journeys"
            title="Domestic Holiday Packages"
            sub="Our most-loved itineraries — every one adjustable to your dates, pace and budget."
          />
          <Reveal delay={0.2} className="hidden shrink-0 gap-2.5 md:flex">
            <button data-testid="packages-prev" onClick={() => scroll(-1)} aria-label="Previous packages" className="rounded-full border border-ocean/20 p-3 text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <button data-testid="packages-next" onClick={() => scroll(1)} aria-label="Next packages" className="rounded-full border border-ocean/20 p-3 text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
              <ChevronRight size={18} />
            </button>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.15}>
        <div
          ref={trackRef}
          data-testid="packages-track"
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} onOpen={(pkg) => navigate(`/packages/${pkg.id}`)} onBook={(pkg) => openBooking(pkg.name)} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
