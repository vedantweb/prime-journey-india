import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { heroSlides } from '../data/destinations';
import { EffectLayer } from './effects/EnvironmentEffects';
import { scrollToId } from './Header';
import { useUI } from '../context/UIContext';

const DURATION = 9000;

const TINTS = {
  warm: 'from-amber-600/20 via-transparent to-orange-950/40',
  cool: 'from-sky-800/25 via-transparent to-cyan-950/45',
  gold: 'from-amber-500/15 via-transparent to-amber-950/45',
};

const textContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};
const clipUp = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState(null);
  const { openBooking } = useUI();
  const slide = heroSlides[index];
  const [firstWord, ...restWords] = slide.headline.split(' ');

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 40, damping: 18 });
  const py = useSpring(my, { stiffness: 40, damping: 18 });

  const goTo = useCallback(
    (i) => {
      setIndex((cur) => {
        if (i === cur) return cur;
        setPrev(cur);
        return i;
      });
    },
    []
  );

  useEffect(() => {
    const t = setTimeout(() => goTo((index + 1) % heroSlides.length), DURATION);
    return () => clearTimeout(t);
  }, [index, goTo]);

  const onMouseMove = (e) => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const { innerWidth, innerHeight } = window;
    mx.set((e.clientX / innerWidth - 0.5) * 16);
    my.set((e.clientY / innerHeight - 0.5) * 10);
  };

  const renderSlide = (s, z, animated) => (
    <motion.div
      key={s.key}
      className="absolute inset-0"
      style={{ zIndex: z }}
      initial={animated ? { clipPath: 'inset(0 0 100% 0)' } : false}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 1.4, ease: [0.65, 0, 0.25, 1] }}
      onAnimationComplete={() => animated && setPrev(null)}
    >
      <motion.div className="absolute inset-0" style={{ x: px, y: py, scale: 1.04 }}>
        <img
          src={s.image}
          alt={s.alt}
          className={`h-full w-full object-cover ${animated ? 'kenburns' : ''}`}
          loading={s.key === 'rajasthan' ? 'eager' : 'lazy'}
          fetchPriority={s.key === 'rajasthan' ? 'high' : 'auto'}
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-b ${TINTS[s.theme]}`} />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ocean-deep/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ocean-deep/65 via-ocean-deep/10 to-transparent" />
      {animated && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.3 }}>
          <EffectLayer effects={s.effects} />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <section
      data-testid="hero"
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-ocean-deep"
      onMouseMove={onMouseMove}
      aria-label="Featured destinations"
    >
      {prev !== null && renderSlide(heroSlides[prev], 0, false)}
      {renderSlide(slide, 10, true)}

      {/* text */}
      <div className="absolute inset-0 z-30 flex items-end pb-28 sm:items-center sm:pb-0">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              variants={textContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -18, transition: { duration: 0.4 } }}
              className="max-w-3xl"
            >
              <motion.p
                variants={fadeUp}
                data-testid="hero-eyebrow"
                className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-gold sm:text-xs"
              >
                <span className="h-px w-10 bg-gold" /> {slide.eyebrow}
              </motion.p>
              <h1 className="font-display font-extrabold leading-[0.98] tracking-tight text-white text-shadow-hero">
                <span className="block overflow-hidden">
                  <motion.span variants={clipUp} className="block text-2xl font-bold text-white/90 sm:text-3xl">
                    {firstWord}
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    variants={clipUp}
                    data-testid="hero-headline"
                    className="block text-5xl sm:text-6xl"
                  >
                    {restWords.join(' ')}
                  </motion.span>
                </span>
              </h1>
              <motion.p
                variants={fadeUp}
                data-testid="hero-sub"
                className="mt-5 max-w-xl font-editorial text-lg italic text-white/90 sm:text-xl"
              >
                {slide.sub}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  data-testid="hero-cta-primary"
                  onClick={() => scrollToId('destinations')}
                  className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-7 py-3.5 font-display text-sm font-bold text-ocean-deep shadow-[0_10px_30px_rgba(255,153,51,0.45)] transition-colors duration-300 hover:bg-coral hover:text-white"
                >
                  {slide.cta.primary} <ArrowRight size={16} />
                </button>
                <button
                  data-testid="hero-cta-secondary"
                  onClick={() => scrollToId('packages')}
                  className="rounded-full border border-white/50 bg-white/10 px-7 py-3.5 font-display text-sm font-bold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/20"
                >
                  {slide.cta.secondary}
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* indicators */}
      <div className="absolute bottom-24 right-5 z-30 flex flex-col items-end gap-2.5 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2">
        {heroSlides.map((s, i) => (
          <button
            key={s.key}
            data-testid={`hero-dot-${s.key}`}
            onClick={() => goTo(i)}
            aria-label={`Show ${s.headline}`}
            className="group flex items-center gap-2.5"
          >
            <span
              className={`hidden font-display text-[11px] font-bold uppercase tracking-[0.25em] transition-opacity duration-300 sm:block ${
                i === index ? 'text-white opacity-100' : 'text-white/60 opacity-0 group-hover:opacity-100'
              }`}
            >
              {s.key}
            </span>
            <span className={`block h-[3px] overflow-hidden rounded-full transition-[width,background-color] duration-500 ${i === index ? 'w-12 bg-white/30' : 'w-5 bg-white/35 group-hover:bg-white/60'}`}>
              {i === index && (
                <span key={index} className="hero-progress block h-full w-full bg-saffron" style={{ animationDuration: `${DURATION}ms` }} />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* scroll cue */}
      <button
        data-testid="hero-scroll-cue"
        onClick={() => scrollToId('destinations')}
        className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-white/80 transition-colors duration-300 hover:text-white"
        aria-label="Scroll to destinations"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </button>
    </section>
  );
}
