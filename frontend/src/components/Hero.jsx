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
        style={{ x: px, y: py, scale: 1.04 }}
      >
        <img
          src={s.image}
          alt={s.alt}
          className={`h-full w-full object-cover ${incoming ? 'hero-zoom' : ''} ${s.key === heroSlides[0].key ? '' : s.key === 'amritsar' ? 'saturate-[1.28] contrast-[1.06] brightness-[1.04]' : 'saturate-[1.12] contrast-[1.04]'}`}
          loading={s.key === heroSlides[0].key ? 'eager' : 'lazy'}
          fetchPriority={s.key === heroSlides[0].key ? 'high' : 'auto'}
          decoding="async"
          width="2000"
          height="1125"
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-b ${TINTS[s.theme]}`} />
      <div className="pointer-events-none absolute left-0 top-[28%] h-[48%] w-[68%] bg-gradient-to-b from-black/42 via-black/22 to-transparent blur-[18px]" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ocean-deep/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-ocean-deep/70 via-ocean-deep/10 to-transparent" />
      {incoming && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.4 }}>
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

      {/* cinematic blue campaign card */}
      <motion.div
        key={`panel-${slide.key}`}
        initial={{ y: "-28%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-14%", opacity: 0 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-[2.5%] top-[3%] z-20 h-[50%] w-[calc(100vw-1rem)] max-w-[500px] overflow-hidden rounded-[1.5rem] bg-[#0875D1]/80 shadow-[18px_20px_50px_rgba(0,31,74,0.14)] sm:top-[2.5%] sm:h-[55%] sm:w-[36vw] sm:min-w-[390px]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.16),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/10 via-black/5 to-transparent" />
      </motion.div>

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
              className="pointer-events-auto absolute left-5 top-[11%] z-40 flex w-[calc(100vw-4rem)] max-w-[430px] max-h-[58%] overflow-hidden flex-col sm:left-8 sm:top-[12%] sm:w-[min(430px,calc(42vw-6rem))] lg:left-[clamp(2rem,5vw,5.5rem)]"
            >
              <motion.div
                variants={fadeUp}
                className="mb-5"
              >
                <p className="font-body text-2xl font-black uppercase leading-none tracking-[0.22em] text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.45)] sm:text-3xl lg:text-4xl">
                  PRIME JOURNEY
                </p>
                <p className="mt-1 font-body text-xl font-black uppercase leading-none tracking-[0.42em] text-[#FFD36A] drop-shadow-[0_3px_14px_rgba(0,0,0,0.45)] sm:text-2xl lg:text-3xl">
                  INDIA
                </p>
              </motion.div>

              <motion.p
                variants={fadeUp}
                data-testid="hero-eyebrow"
                className="mb-4 flex items-center gap-3 font-body text-xs font-extrabold uppercase tracking-[0.32em] text-[#FFD36A] sm:text-sm"
              >
                <span className="h-px w-10 bg-gold" />
                {slide.eyebrow}
              </motion.p>

              <h1 className="font-display font-bold leading-[0.92] tracking-tight text-white text-shadow-hero">
                {slide.headlineLines ? (
                  slide.headlineLines.map((line, li) => (
                    <span key={line} className="block overflow-hidden">
                      <motion.span
                        variants={clipUp}
                        data-testid={li === 0 ? 'hero-headline' : undefined}
                        className={`block text-4xl sm:text-5xl lg:text-6xl ${li === slide.headlineLines.length - 1 ? 'italic text-[#FFD36A]' : ''}`}
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
                        className="block font-body text-lg font-bold uppercase tracking-[0.3em] text-white/90 sm:text-xl"
                      >
                        {firstWord}
                      </motion.span>
                    </span>

                    <span className="block overflow-hidden">
                      <motion.span
                        variants={clipUp}
                        data-testid="hero-headline"
                        className="block text-5xl sm:text-6xl lg:text-7xl"
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
                className="mt-4 max-w-[420px] font-body text-base font-semibold leading-relaxed text-white sm:text-lg lg:text-xl"
              >
                {slide.sub}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
              >
                <button
                  data-testid="hero-cta-primary"
                  onClick={() => scrollToId('destinations')}
                  className="btn-arrow group flex items-center gap-1.5 rounded-full bg-saffron px-4 py-3 text-xs sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm font-body text-sm font-bold text-ocean-deep shadow-[0_10px_30px_rgba(255,153,51,0.45)] transition-colors duration-300 hover:bg-coral hover:text-white"
                >
                  {slide.ctaPrimary || slide.headline} <ArrowRight size={16} />
                </button>

                <button
                  data-testid="hero-cta-secondary"
                  onClick={() => scrollToId('packages')}
                  className="rounded-full border border-white/60 bg-white/10 px-4 py-3 font-body text-xs font-bold sm:px-7 sm:py-3.5 sm:text-sm text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/20"
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
            <div className="torn-paper px-4 py-4 sm:px-5 sm:py-6">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.28em] text-coral sm:text-[10px]">
                Season Offer
              </p>

              <p className="mt-1 font-display text-base font-bold uppercase leading-tight text-ocean sm:mt-1.5 sm:text-lg">
                {offer.name}
              </p>

              <div className="mt-2 flex items-end gap-2.5">
                <span className="text-[13px] font-semibold text-ink/40 line-through decoration-coral decoration-2">
                  {inr(offer.priceFrom)}
                </span>

                <PriceCounter
                  key={`price-${slide.key}`}
                  from={offer.priceFrom}
                  to={offer.priceTo}
                  duration={1.9}
                  testid="hero-offer-price"
                  className="font-body text-3xl font-extrabold tracking-tight text-saffron sm:text-4xl"
                />
              </div>

              <p className="mt-1 text-[9px] font-bold text-ink/55 sm:text-[11px]">
                {offer.duration}
              </p>

              <Link
                data-testid="hero-offer-link"
                to={`/packages/${offer.id}`}
                className="btn-arrow group mt-3 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ocean transition-colors duration-200 hover:text-coral sm:mt-5 sm:text-sm"
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
      <div className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 lg:flex">
        {heroSlides.map((s, i) => (
          <button
            key={s.key}
            data-testid={`hero-dot-${s.key}`}
            onClick={() => goTo(i)}
            aria-label={`Show ${s.headline}`}
            className="group flex items-center gap-2.5"
          >
            <span
              className={`font-body text-[10px] font-bold uppercase tracking-[0.25em] transition-opacity duration-300 ${
                i === index ? 'text-white opacity-100' : 'text-white/60 opacity-0 group-hover:opacity-100'
              }`}
            >
              {s.eyebrow}
            </span>
            <span className={`block h-[3px] overflow-hidden rounded-full transition-[width,background-color] duration-500 ${i === index ? 'w-12 bg-white/30' : 'w-5 bg-white/35 group-hover:bg-white/60'}`}>
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
