import { ArrowRight, Eye, Heart, Map, Target } from 'lucide-react';
import { aboutHeroImage } from '../data/destinations';
import { leadership, story } from '../data/company';
import { MonogramAvatar } from '../components/Leadership';
import { Reveal, SectionHeading } from '../components/Section';
import { scrollToId } from '../components/Header';

const PILLARS = [
  { Icon: Map, title: 'Our Story', body: story.ourStory },
  { Icon: Eye, title: 'Vision', body: story.vision },
  { Icon: Target, title: 'Mission', body: story.mission },
  { Icon: Heart, title: 'Travel Philosophy', body: story.philosophy },
];

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="relative flex h-[52vh] min-h-[380px] items-end overflow-hidden">
        <img src={aboutHeroImage.src} alt={aboutHeroImage.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/30 to-ocean-deep/30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8">
          <Reveal>
            <p className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-gold">
              <span className="h-px w-9 bg-gold" /> About Us
            </p>
            <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              A travel house built on <span className="font-editorial font-normal italic text-gold">trust.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {PILLARS.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 2) * 0.1}>
                <div data-testid={`about-${title.toLowerCase().replace(/\s+/g, '-')}`} className="h-full rounded-3xl bg-cloud p-8 sm:p-10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron/15 text-saffron">
                    <Icon size={22} />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-extrabold text-ocean">{title}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/65">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-20">
            <SectionHeading eyebrow="What We Stand For" title="Our Values" align="center" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {story.values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.08}>
                  <div className="h-full rounded-3xl border border-ocean/10 p-7 transition-[box-shadow,border-color] duration-300 hover:border-saffron/50 hover:shadow-[0_16px_40px_rgba(6,24,43,0.1)]">
                    <span className="font-display text-3xl font-extrabold text-saffron/40">0{i + 1}</span>
                    <h3 className="mt-3 font-display text-lg font-extrabold text-ocean">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Leadership"
            title="The Dhir Family"
            sub="One family, one promise — every journey planned like it is our own."
            align="center"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {leadership.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <div data-testid={`about-leader-${p.id}`} className="flex h-full flex-col items-center rounded-3xl bg-white p-9 text-center shadow-[0_10px_40px_rgba(6,24,43,0.07)]">
                  <MonogramAvatar initials={p.initials} tone={p.tone} testid={`about-avatar-${p.id}`} />
                  <h3 className="mt-6 font-display text-xl font-extrabold text-ocean">{p.name}</h3>
                  <span className="mt-2 rounded-full bg-saffron/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-saffron">{p.role}</span>
                  <p className="mt-4 text-sm leading-relaxed text-ink/60">{p.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-14 flex justify-center">
            <button
              data-testid="about-cta"
              onClick={() => scrollToId('customize')}
              className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-8 py-4 font-display text-sm font-bold text-ocean-deep shadow-[0_10px_30px_rgba(255,153,51,0.4)] transition-colors duration-300 hover:bg-coral hover:text-white"
            >
              Start planning with us <ArrowRight size={16} />
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
