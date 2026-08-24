import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarCheck, Check, MapPin } from 'lucide-react';
import { destinations } from '../data/destinations';
import { packages as staticPackages } from '../data/packages';
import usePackagePrices from '../hooks/usePackagePrices';
import { experiences } from '../data/experiences';
import { Reveal } from '../components/Section';
import { inr } from '../components/PriceCounter';
import { useUI } from '../context/UIContext';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openBooking } = useUI();
  const packages = usePackagePrices();
  const d = destinations.find((x) => x.id === id);

  useEffect(() => {
    if (!d) return;

    const seo = {
      kashmir: {
        title: 'Kashmir Tour Packages from Amritsar | Prime Journey India',
        description: 'Plan a Kashmir trip from Amritsar with Prime Journey India. Explore Srinagar, Gulmarg, Pahalgam and more with customized Kashmir tour packages.',
      },
      rajasthan: {
        title: 'Rajasthan Tour Packages from Amritsar | Prime Journey India',
        description: 'Explore Jaipur, Jodhpur, Udaipur and Jaisalmer with customized Rajasthan tour packages from Amritsar by Prime Journey India.',
      },
      amritsar: {
        title: 'Best Travel Agency in Amritsar | Prime Journey India',
        description: 'Prime Journey India is a travel agency in Amritsar offering customized holidays, India tour packages and trips to Kashmir, Himachal, Ladakh, Rajasthan and more.',
      },
      himachal: {
        title: 'Himachal Tour Packages from Amritsar | Prime Journey India',
        description: 'Plan a Himachal trip from Amritsar with Prime Journey India. Explore Manali, Shimla, Solang Valley and the Himalayan mountains with customized tour packages.',
      },
      kerala: {
        title: 'Kerala Tour Packages from Amritsar | Prime Journey India',
        description: 'Discover Kerala from Amritsar with customized holiday packages covering Munnar, Alleppey, Kochi and the famous Kerala backwaters.',
      },
      goa: {
        title: 'Goa Tour Packages from Amritsar | Prime Journey India',
        description: 'Plan your Goa holiday from Amritsar with Prime Journey India. Customized Goa tour packages, beaches, heritage and unforgettable coastal experiences.',
      },
      ladakh: {
        title: 'Ladakh Tour Packages from Amritsar | Prime Journey India',
        description: 'Plan a Ladakh trip from Amritsar with Prime Journey India. Explore Leh, Nubra Valley and Pangong Lake with a customized 6 Nights / 7 Days Ladakh tour.',
      },
      northeast: {
        title: 'Northeast India Tour Packages from Amritsar | Prime Journey India',
        description: 'Explore Meghalaya, Sikkim and Northeast India from Amritsar with customized holiday and tour packages by Prime Journey India.',
      },
      uttarakhand: {
        title: 'Uttarakhand Tour Packages from Amritsar | Prime Journey India',
        description: 'Plan an Uttarakhand trip from Amritsar with Prime Journey India. Explore Rishikesh, Auli, Nainital and the Himalayan landscapes with customized tours.',
      },
    };

    const data = seo[d.id] || {
      title: `${d.name} Tour Packages from Amritsar | Prime Journey India`,
      description: `Plan a customized ${d.name} trip from Amritsar with Prime Journey India.`,
    };

    document.title = data.title;

    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', data.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://primejourneyindia.com/destinations/${d.id}`);
  }, [d]);

  if (!d) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ocean">Destination not found</h1>
        <Link to="/" className="rounded-full bg-saffron px-6 py-3 font-body text-sm font-bold text-ocean-deep">Back to home</Link>
      </div>
    );
  }

  const relatedPackages = packages.filter((p) => p.destination.toLowerCase() === d.id || p.route.toLowerCase().includes(d.name.toLowerCase()));
  const relatedExperiences = experiences.filter((e) => e.destId === d.id);

  return (
    <div data-testid={`destination-page-${d.id}`}>
      <section className="relative flex h-[56vh] min-h-[400px] items-end overflow-hidden">
        <img src={d.image} alt={d.alt} className="hero-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/25 to-ocean-deep/30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
          <Reveal>
            <button data-testid="destination-back" onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70 transition-colors duration-200 hover:text-gold">
              <ArrowLeft size={14} /> All Destinations
            </button>
            <h1 className="font-display text-5xl font-bold text-white text-shadow-hero sm:text-6xl lg:text-7xl">{d.name}</h1>
            <p className="mt-3 font-editorial text-xl italic text-white/85 sm:text-2xl">{d.tagline}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Reveal>
              <p className="text-base leading-relaxed text-ink/70 md:text-lg">{d.intro}</p>
            </Reveal>
            <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {d.highlights.map((h, i) => (
                <Reveal key={h} delay={i * 0.06}>
                  <div className="flex items-start gap-3 rounded-2xl bg-cloud p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-turq/15 text-turq"><Check size={13} /></span>
                    <span className="text-sm font-semibold leading-snug text-ocean">{h}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-ocean p-8 text-white">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-gold"><CalendarCheck size={14} /> Best Time</p>
              <p className="mt-2 font-display text-xl font-bold">{d.bestTime}</p>
              <button
                data-testid="destination-book-cta"
                onClick={() => openBooking(d.name)}
                className="btn-arrow group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-saffron py-3.5 font-body text-sm font-bold text-ocean-deep transition-colors duration-300 hover:bg-gold"
              >
                Plan a {d.name} Journey <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {d.gallery.map((g, i) => (
              <Reveal key={g.src} delay={i * 0.08}>
                <div className="img-hover-zoom h-60 overflow-hidden rounded-3xl">
                  <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {relatedPackages.length > 0 && (
        <section className="bg-cloud py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <h2 className="font-display text-3xl font-bold text-ocean">Journeys in {d.name}</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <Link
                    data-testid={`destination-package-${p.id}`}
                    to={`/packages/${p.id}`}
                    className="img-hover-zoom group block overflow-hidden rounded-3xl bg-white shadow-[0_10px_36px_rgba(6,24,43,0.08)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,24,43,0.14)]"
                  >
                    <div className="h-44 overflow-hidden"><img src={p.image} alt={p.alt} loading="lazy" className="h-full w-full object-cover" /></div>
                    <div className="p-5">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-turq"><MapPin size={11} /> {p.duration}</p>
                      <h3 className="mt-1.5 font-display text-xl font-bold text-ocean">{p.name}</h3>
                      <p className="mt-2 text-sm font-bold text-ocean">From {inr(p.priceTo)} <span className="font-medium text-ink/40 line-through">{inr(p.priceFrom)}</span></p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedExperiences.length > 0 && (
        <section className="bg-white pb-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-ocean">Signature experiences here</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {relatedExperiences.map((e) => (
                  <span key={e.id} data-testid={`destination-experience-${e.id}`} className="rounded-full border border-ocean/12 bg-cloud px-5 py-2.5 text-sm font-bold text-ocean">
                    {e.title}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}
