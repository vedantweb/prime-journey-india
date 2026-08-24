import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { heroSlides } from '../data/destinations';
import { packages } from '../data/packages';
import { EffectLayer } from './effects/EnvironmentEffects';
import { scrollToId } from './Header';
import { useUI } from '../context/UIContext';
import PriceCounter, { inr } from './PriceCounter';
import SearchBar from './SearchBar';

const DURATION = 9000;

const TINTS = {
  warm: 'from-amber-600/20 via-transparent to-orange-950/40',
  cool: 'from-sky-800/25 via-transparent to-cyan-950/45',
  gold: 'from-amber-500/15 via-transparent to-amber-950/45',
};

const textContainer = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.45 } } };
const clipUp = { hidden: { y: '-115%', opacity: 0 }, show: { y: '0%', opacity: 1, transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } } };
const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };


function preloadHeroImages() {
  // Only preload the first/master hero image.
  // Other slides load lazily when they become active.
  const first = heroSlides[0];
  if (!first) return;

  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "high";
  img.src = first.image;
}

export default function Hero() {
  useEffect(() => {
    preloadHeroImages();
  }, []);


  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState(null);
  const [heroImageReady, setHeroImageReady] = useState(false);
  const { openBooking } = useUI();
  const slide = heroSlides[index];
  const [firstWord, ...restWords] = slide.headline.split(' ');
  const offer = packages.find((p) => p.id === slide.offerPackage);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 40, damping: 18 });
  const py = useSpring(my, { stiffness: 40, damping: 18 });

  const goTo = useCallback((i) => {
    setIndex((cur) => {
      if (i === cur) return cur;
      setPrev(cur);
      return i;
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => goTo((index + 1) % heroSlides.length), DURATION);
    return () => clearTimeout(t);
  }, [index, goTo]);

  // unmount outgoing slide after the cinematic hand-off completes
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 1750);
    return () => clearTimeout(t);
  }, [prev]);

  const onMouseMove = (e) => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const { innerWidth, innerHeight } = window;
    mx.set((e.clientX / innerWidth - 0.5) * 16);
    my.set((e.clientY / innerHeight - 0.5) * 10);
  };

  const renderSlide = (s, z, incoming) => (
    <motion.div
      key={incoming ? s.key : `${s.key}-out`}
      className="absolute inset-0"
      style={{ zIndex: z }}
      initial={incoming ? { opacity: 0, scale: 1.025 } : { opacity: 1, scale: 1.01 }}
      animate={incoming ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
      transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className={`absolute inset-0 ${s.key === heroSlides[0].key ? '' : '-translate-y-[3%] scale-[1.04]'}`}
        style={{ x: px, y: s.key === heroSlides[0].key ? py - 0.15 : s.key === 'jaipur' ? py - 0.20 : py, scale: 1.04 }}
      >
        <img
          src={s.image}
          alt={s.alt}
          className={`h-full w-full object-cover object-top ${incoming ? 'hero-zoom' : ''} ${s.key === heroSlides[0].key ? '' : s.key === 'amritsar' ? 'saturate-[1.28] contrast-[1.06] brightness-[1.04]' : 'saturate-[1.12] contrast-[1.04]'}`}
          loading={s.key === heroSlides[0].key ? 'eager' : 'lazy'}
          fetchPriority={s.key === heroSlides[0].key ? 'high' : 'auto'}
          decoding="async"
          width="2000"
          height="1125"
          onLoad={() => {
            if (s.key === heroSlides[0].key) {
              setHeroImageReady(true);
            }
          }}
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-b ${TINTS[s.theme]}`} />
      <div className="pointer-events-none absolute left-0 top-[28%] h-[48%] w-[68%] bg-gradient-to-b from-black/42 via-black/22 to-transparent blur-[18px]" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ocean-deep/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-ocean-deep/70 via-ocean-deep/10 to-transparent" />
      {incoming && heroImageReady && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.15 }}>
          <EffectLayer effects={s.effects} />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <section
      data-testid="hero"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ocean-deep"
      onMouseMove={onMouseMove}
      aria-label="Featured destinations"
    >
      {prev !== null && renderSlide(heroSlides[prev], 0, false)}
      {renderSlide(slide, 10, true)}

      <motion.div
        key={`panel-${slide.key}`}
        initial={{ y: "-28%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-14%", opacity: 0 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-[2.5%] top-[17%] z-20 h-[70%] w-[calc(100vw-1rem)] max-w-[500px] overflow-hidden rounded-[1.75rem] border border-white/15 bg-black/50 shadow-[0_28px_80px_rgba(0,31,74,0.28),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[3px] sm:top-[2.5%] sm:h-[55%] sm:w-[36vw] sm:min-w-[390px]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.20),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.05),transparent_45%,rgba(0,35,90,0.12))]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ocean-deep/20 via-black/5 to-transparent" />
      </motion.div>

      {/* floating brand title over hero image */}
      <div className="pointer-events-none absolute left-1/2 top-[3%] z-40 -translate-x-1/2 text-center sm:left-[66%] sm:top-[5%] select-none">
        <p className="font-[Montserrat] font-bold uppercase whitespace-nowrap text-[32px] sm:text-[58px] lg:text-[65px] leading-none tracking-[0.035em] transform scale-y-[1.12]">
          <span
            className="text-white"

          >
            PRIME JOURNEY
          </span>{' '}
          <span className="text-[#F39A2F]">INDIA</span>
        </p>
      </div>

      {/* hero copy */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="mx-auto h-full w-full max-w-7xl px-5 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              variants={textContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -18, transition: { duration: 0.35 } }}
              className="pointer-events-auto absolute left-5 top-[19%] z-40 flex w-[calc(100vw-2.5rem)] max-w-[500px] max-h-[72%] overflow-hidden flex-col sm:left-8 sm:top-[7%] sm:w-[min(500px,36vw)] lg:left-[clamp(2rem,5vw,5.5rem)]"
            >
              <motion.div
                variants={fadeUp}
                className="mb-5"
              >
              </motion.div>

              <motion.p
                variants={fadeUp}
                data-testid="hero-eyebrow"
                className="mb-5 flex items-center gap-3 font-body text-[11px] font-bold uppercase tracking-[0.32em] text-[#E2C98A] sm:text-xs"
              >
                <span className="h-px w-10 bg-[#E2C98A]" />
                {slide.eyebrow}
              </motion.p>

              <h1 className="font-display font-semibold leading-[0.94] tracking-[-0.035em] text-[#F8F5EE]">
                {slide.headlineLines ? (
                  slide.headlineLines.map((line, li) => (
                    <span key={line} className="block overflow-hidden">
                      <motion.span
                        variants={clipUp}
                        data-testid={li === 0 ? 'hero-headline' : undefined}
                        className={`block text-[2.5rem] sm:text-[3.05rem] lg:text-[3.65rem] leading-[0.96] ${
                          li === slide.headlineLines.length - 1
                            ? 'text-[#E2C98A]'
                            : 'text-[#F8F5EE]'
                        }`}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))
                ) : (
                  <>
                    <span className="block overflow-hidden">
                      <motion.span
                        variants={clipUp}
                        className="block font-body text-lg font-bold uppercase tracking-[0.3em] text-[#F7F1E3]/90 sm:text-xl"
                      >
                        {firstWord}
                      </motion.span>
                    </span>

                    <span className="block overflow-hidden">
                      <motion.span
                        variants={clipUp}
                        data-testid="hero-headline"
                        className="block text-[3.4rem] sm:text-[4.15rem] lg:text-[5rem]"
                      >
                        {restWords.join(' ')}
                      </motion.span>
                    </span>
                  </>
                )}
              </h1>

              <motion.p
                variants={fadeUp}
                data-testid="hero-sub"
                className="mt-5 max-w-[430px] font-body text-[15px] font-semibold leading-[1.65] text-[#E8E2D5] drop-shadow-[0_2px_8px_rgba(0,0,0,0.32)] sm:text-lg lg:text-xl"
              >
                {slide.sub}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
              >
                <button
                  data-testid="hero-cta-primary"
                  onClick={() => scrollToId('destinations')}
                  className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-5 py-3.5 font-body text-sm font-bold text-ocean-deep shadow-[0_12px_32px_rgba(255,153,51,0.38)] ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral hover:text-white hover:shadow-[0_16px_38px_rgba(255,153,51,0.42)] sm:px-7 sm:py-3.5"
                >
                  {slide.ctaPrimary || slide.headline} <ArrowRight size={16} />
                </button>

                <button
                  data-testid="hero-cta-secondary"
                  onClick={() => scrollToId('packages')}
                  className="rounded-full border border-white/55 bg-white/10 px-5 py-3.5 font-body text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/20 sm:px-7 sm:py-3.5"
                >
                  View Packages
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* independent hero torn-paper offer */}
      {offer && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-offer-${slide.key}`}
            initial={{ opacity: 0, y: 24, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            exit={{ opacity: 0, y: -14, rotate: 2 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-[48%] z-50 w-[220px] -translate-x-1/2 sm:left-[45%] sm:top-[34%] sm:w-[340px] sm:-translate-y-1/2"
          >
            <div className="torn-paper px-5 py-5 shadow-[0_22px_55px_rgba(6,24,43,0.24)] sm:px-7 sm:py-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.34em] text-coral sm:text-xs">
                Season Offer
              </p>

              <p className="mt-2 font-display text-[1.35rem] font-bold uppercase leading-[1.05] tracking-tight text-ocean sm:text-[1.7rem]">
                {offer.name}
              </p>

              <button
                data-testid="hero-offer-get-price"
                onClick={() => openBooking(offer.name)}
                className="btn-arrow mt-4 inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.08em] text-ocean-deep shadow-[0_10px_25px_rgba(255,153,51,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral hover:text-white sm:px-6 sm:py-3"
              >
                Get Price <ArrowRight size={14} />
              </button>

              <p className="mt-2 text-[11px] font-bold tracking-wide text-ink/55 sm:text-xs">
                {offer.duration}
              </p>

              <Link
                data-testid="hero-offer-link"
                to={`/packages/${offer.id}`}
                className="btn-arrow group mt-4 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ocean transition-all duration-200 hover:translate-x-0.5 hover:text-coral sm:mt-5 sm:text-sm"
              >
                View Journey <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* search */}
      <div className="absolute inset-x-0 bottom-[4.5rem] z-40 flex justify-center px-4 sm:bottom-[5rem] sm:px-5">
        <SearchBar className="w-full max-w-[560px]" />
      </div>

      {/* indicators */}
      <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
        {heroSlides.map((s, i) => (
          <button
            key={s.key}
            data-testid={`hero-dot-${s.key}`}
            onClick={() => goTo(i)}
            aria-label={`Show ${s.headline}`}
            className="group flex items-center gap-2.5"
          >
            <span
              className={`font-body text-[10px] font-extrabold uppercase tracking-[0.24em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-opacity duration-300 ${
                i === index ? 'text-white opacity-100' : 'text-white/60 opacity-0 group-hover:opacity-100'
              }`}
            >
              {s.eyebrow}
            </span>
            <span className={`block h-[3px] overflow-hidden rounded-full shadow-[0_0_8px_rgba(255,255,255,0.15)] transition-[width,background-color,box-shadow] duration-500 ${i === index ? 'w-14 bg-white/35' : 'w-5 bg-white/35 group-hover:bg-white/65'}`}>
              {i === index && (
                <span key={index} className="hero-progress block h-full w-full bg-saffron" style={{ animationDuration: `${DURATION}ms` }} />
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
