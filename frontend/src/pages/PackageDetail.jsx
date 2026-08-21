import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BedDouble, CalendarCheck, Check, Minus, UtensilsCrossed, Car, Info } from 'lucide-react';
import { packages as staticPackages } from '../data/packages';
import usePackagePrices from '../hooks/usePackagePrices';
import { Reveal } from '../components/Section';
import PriceCounter, { inr } from '../components/PriceCounter';
import { siteConfig } from '../data/siteConfig';
import { useUI } from '../context/UIContext';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openBooking } = useUI();
  const packages = usePackagePrices();
  const pkg = packages.find((x) => x.id === id);

  if (!pkg) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ocean">Journey not found</h1>
        <Link to="/" className="rounded-full bg-saffron px-6 py-3 font-body text-sm font-bold text-ocean-deep">Back to home</Link>
      </div>
    );
  }

  const related = packages.filter((p) => p.id !== pkg.id && p.destination === pkg.destination);
  const relatedList = (related.length ? related : packages.filter((p) => p.id !== pkg.id)).slice(0, 3);

  const facts = [
    { Icon: BedDouble, label: 'Stay', value: pkg.stay },
    { Icon: UtensilsCrossed, label: 'Meals', value: pkg.meals },
    { Icon: Car, label: 'Transfers', value: pkg.transfers },
    { Icon: CalendarCheck, label: 'Best Time', value: pkg.bestTime },
  ];

  return (
    <div data-testid={`package-page-${pkg.id}`}>
      <section className="relative flex h-[58vh] min-h-[420px] items-end overflow-hidden">
        <img src={pkg.image} alt={pkg.alt} className="hero-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/90 via-ocean-deep/25 to-ocean-deep/30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <Reveal>
            <button data-testid="package-back" onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70 transition-colors duration-200 hover:text-gold">
              <ArrowLeft size={14} /> All Packages
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-gold">{pkg.destination} · {pkg.duration}</p>
            <h1 className="mt-2 font-display text-5xl font-bold text-white text-shadow-hero sm:text-6xl">{pkg.name}</h1>
            <p className="mt-3 font-editorial text-xl italic text-white/85">{pkg.route}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Reveal>
              <h2 className="font-display text-3xl font-bold text-ocean">Highlights</h2>
              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {pkg.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-3 rounded-2xl bg-cloud p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron/15 text-saffron"><Check size={13} /></span>
                    <span className="text-sm font-semibold leading-snug text-ocean">{h}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="mt-14 font-display text-3xl font-bold text-ocean">Itinerary</h2>
              <div className="mt-6 flex flex-col gap-0">
                {pkg.itinerary.map((d, i) => (
                  <div key={d.day} data-testid={`itinerary-${i}`} className="relative flex gap-5 pb-8 last:pb-0">
                    {i < pkg.itinerary.length - 1 && <span className="absolute left-[19px] top-10 h-full w-px bg-ocean/10" />}
                    <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean font-body text-[11px] font-extrabold text-white">{i + 1}</span>
                    <div className="pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-turq">{d.day}</p>
                      <h3 className="mt-0.5 font-display text-xl font-bold text-ocean">{d.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{d.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-14 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-turq/25 bg-turq/5 p-7">
                  <h3 className="font-display text-xl font-bold text-ocean">Inclusions</h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {pkg.inclusions.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-sm font-medium text-ink/70"><Check size={15} className="mt-0.5 shrink-0 text-turq" />{x}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-coral/25 bg-coral/5 p-7">
                  <h3 className="font-display text-xl font-bold text-ocean">Exclusions</h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {pkg.exclusions.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-sm font-medium text-ink/70"><Minus size={15} className="mt-0.5 shrink-0 text-coral" />{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="mt-14 font-display text-3xl font-bold text-ocean">Gallery</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {pkg.gallery.map((g, i) => (
                  <div key={g.src} className={`img-hover-zoom overflow-hidden rounded-3xl ${i === 0 ? 'sm:col-span-2 h-64' : 'h-64'}`}>
                    <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-14 rounded-3xl bg-cloud p-7">
                <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ocean"><Info size={18} className="text-saffron" /> Important Information</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {pkg.important.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/65">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />{x}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal delay={0.1} className="lg:sticky lg:top-24">
              <div data-testid="package-price-card" className="rounded-3xl bg-ocean p-8 text-white shadow-[0_24px_60px_rgba(6,24,43,0.25)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Get Your Price</p>
                <button
                  data-testid="package-detail-get-price"
                  onClick={() => openBooking(pkg.name)}
                  className="btn-arrow mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 font-body text-sm font-extrabold text-ocean-deep transition-colors duration-300 hover:bg-gold"
                >
                  Get Price <ArrowRight size={15} />
                </button>
                <p className="mt-1 text-xs font-semibold text-white/55">per person · {pkg.duration}</p>
                
                <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6">
                  {facts.map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={16} className="mt-0.5 shrink-0 text-gold" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">{label}</p>
                        <p className="mt-0.5 text-[13px] font-medium leading-snug text-white/85">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  data-testid="package-book-cta"
                  onClick={() => openBooking(pkg.name)}
                  className="btn-arrow group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-saffron py-4 font-body text-sm font-bold text-ocean-deep transition-colors duration-300 hover:bg-gold"
                >
                  Get Price <ArrowRight size={15} />
                </button>
                <a
                  data-testid="package-whatsapp-cta"
                  href={siteConfig.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-3.5 font-body text-sm font-bold text-white transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-cloud py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-ocean">Related Journeys</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {relatedList.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link
                  data-testid={`related-package-${p.id}`}
                  to={`/packages/${p.id}`}
                  className="img-hover-zoom group block overflow-hidden rounded-3xl bg-white shadow-[0_10px_36px_rgba(6,24,43,0.08)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,24,43,0.14)]"
                >
                  <div className="h-44 overflow-hidden"><img src={p.image} alt={p.alt} loading="lazy" className="h-full w-full object-cover" /></div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-turq">{p.duration}</p>
                    <h3 className="mt-1.5 font-display text-xl font-bold text-ocean">{p.name}</h3>
                    <p className="mt-2 text-sm font-bold text-ocean">From {inr(p.priceTo)}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
