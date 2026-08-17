import { motion } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

export function Reveal({ children, delay = 0, y = 30, className = '', testid }) {
  return (
    <motion.div
      data-testid={testid}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, sub, dark = false, align = 'left' }) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  return (
    <div className={`flex flex-col ${alignCls}`}>
      {eyebrow && (
        <Reveal>
          <span className={`mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] ${dark ? 'text-gold' : 'text-saffron'}`}>
            <span className={`h-px w-9 ${dark ? 'bg-gold' : 'bg-saffron'}`} />
            {eyebrow}
            {align === 'center' && <span className={`h-px w-9 ${dark ? 'bg-gold' : 'bg-saffron'}`} />}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className={`font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-ocean'}`}>
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className={`mt-4 max-w-2xl text-base md:text-lg ${dark ? 'text-white/75' : 'text-ink/65'}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
