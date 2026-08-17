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
const clipUp = { hidden: { y: '115%' }, show: { y: '0%', transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } };
const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

export default function Hero() {
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
      initial={incoming ? { opacity: 0, scale: 1.07 } : { opacity: 1, scale: 1 }}
      animate={incoming ? { opacity: 1, scale: 1 } : { opacity: 0.4, scale: 0.96, x: '-1.5%' }}
      transition={{ duration: 1.6, ease: [0.65, 0, 0.25, 1] }}
    >
      <motion.div className="absolute inset-0" style={{ x: px, y: py, scale: 1.04 }}>
        <img
          src={s.image}
          alt={s.alt}
          className={`h-full w-full object-cover ${incoming ? 'hero-zoom' : ''}`}
          loading={s.key === 'rajasthan' ? 'eager' : 'lazy'}
          fetchPriority={s.key === 'rajasthan' ? 'high' : 'auto'}
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-b ${TINTS[s.theme]}`} />
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

      {/* text + torn paper offer */}
      <div className="absolute inset-0 z-30 flex items-center pt-8 sm:pt-0">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              variants={textContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -18, transition: { duration: 0.35 } }}
              className="max-w-3xl"
            >
              <motion.p
                variants={fadeUp}
                data-testid="hero-eyebrow"
                className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-gold sm:text-xs"
              >
                <span className="h-px w-10 bg-gold" /> {slide.eyebrow}
              </motion.p>
              <h1 className="font-display font-bold leading-[0.95] tracking-tight text-white text-shadow-hero">
                <span className="block overflow-hidden">
                  <motion.span variants={clipUp} className="block font-body text-lg font-bold uppercase tracking-[0.3em] text-white/85 sm:text-xl">
                    {firstWord}
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    variants={clipUp}
                    data-testid="hero-headline"
                    className="block text-6xl sm:text-7xl lg:text-8xl"
                  >
                    {restWords.join(' ')}
                  </motion.span>
                </span>
              </h1>
              <motion.p
                variants={fadeUp}
                data-testid="hero-sub"
                className="mt-5 max-w-xl font-editorial text-xl italic text-white/90 sm:text-2xl"
              >
                {slide.sub}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  data-testid="hero-cta-primary"
                  onClick={() => scrollToId('destinations')}
                  className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-7 py-3.5 font-body text-sm font-bold text-ocean-deep shadow-[0_10px_30px_rgba(255,153,51,0.45)] transition-colors duration-300 hover:bg-coral hover:text-white"
                >
                  {slide.headline} <ArrowRight size={16} />
                </button>
                <button
                  data-testid="hero-cta-secondary"
                  onClick={() => scrollToId('packages')}
                  className="rounded-full border border-white/50 bg-white/10 px-7 py-3.5 font-body text-sm font-bold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/20"
                >
                  View Packages
                </button>
              </motion.div>

              {/* torn-paper offer inside the hero */}
              {offer && (
                <motion.div variants={fadeUp} className="mt-9 sm:absolute sm:bottom-[7.5rem] sm:right-8 sm:mt-0 sm:w-[290px] lg:right-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slide.key}
                      initial={{ opacity: 0, y: 26, rotate: -5 }}
                      animate={{ opacity: 1, y: 0, rotate: -2 }}
                      exit={{ opacity: 0, y: -14, rotate: 2, transition: { duration: 0.3 } }}
                      transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      data-testid="hero-offer"
                      className="torn-paper max-w-[300px] px-6 py-6"
                    >
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-coral">Season Offer</p>
                      <p className="mt-1.5 font-display text-lg font-bold uppercase leading-tight text-ocean">{offer.name}</p>
                      <div className="mt-2 flex items-end gap-2.5">
                        <span className="text-[13px] font-semibold text-ink/40 line-through decoration-coral decoration-2">{inr(offer.priceFrom)}</span>
                        <PriceCounter
                          key={slide.key}
                          from={offer.priceFrom}
                          to={offer.priceTo}
                          duration={1.9}
                          testid="hero-offer-price"
                          className="font-body text-2xl font-extrabold tracking-tight text-saffron"
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold text-ink/55">{offer.duration}</p>
                      <Link
                        data-testid="hero-offer-link"
                        to={`/packages/${offer.id}`}
                        className="btn-arrow group mt-3 inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest text-ocean transition-colors duration-200 hover:text-coral"
                      >
                        View Journey <ArrowRight size={13} />
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* search */}
      <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-5">
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
