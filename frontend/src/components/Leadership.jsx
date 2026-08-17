import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { leadership } from '../data/company';
import { Reveal, SectionHeading } from './Section';

export const TONES = {
  ocean: 'bg-ocean text-white',
  saffron: 'bg-saffron text-ocean-deep',
  turq: 'bg-turq text-ocean-deep',
  gold: 'bg-gold text-ocean-deep',
};

export function MonogramAvatar({ initials, tone = 'ocean', size = 'h-24 w-24', text = 'text-2xl', testid }) {
  return (
    <span
      data-testid={testid}
      className={`flex ${size} items-center justify-center rounded-full ${TONES[tone]} font-display ${text} font-extrabold shadow-[0_12px_30px_rgba(6,24,43,0.18)] ring-4 ring-white`}
    >
      {initials}
    </span>
  );
}

export default function Leadership() {
  return (
    <section id="people" data-testid="section-people" className="bg-cloud py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The Team"
          title="Meet The People Behind Prime Journey India"
          sub="A family-run travel house from Amritsar — every journey passes through our own hands."
          align="center"
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {leadership.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <div
                data-testid={`leader-${p.id}`}
                className="group flex h-full flex-col items-center rounded-3xl bg-white p-9 text-center shadow-[0_10px_40px_rgba(6,24,43,0.07)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(6,24,43,0.14)]"
              >
                <MonogramAvatar initials={p.initials} tone={p.tone} testid={`leader-avatar-${p.id}`} />
                <h3 className="mt-6 font-display text-xl font-extrabold text-ocean">{p.name}</h3>
                <span className="mt-2 rounded-full bg-saffron/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-saffron">
                  {p.role}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-ink/60">{p.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-12 flex justify-center">
          <Link
            data-testid="link-full-story"
            to="/about"
            className="btn-arrow group flex items-center gap-2 rounded-full border border-ocean/20 px-7 py-3 font-display text-sm font-bold text-ocean transition-colors duration-300 hover:border-ocean hover:bg-ocean hover:text-white"
          >
            Read our full story <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
