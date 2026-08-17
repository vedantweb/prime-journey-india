import { ClipboardCheck, Compass, Headphones, HeartHandshake, Route, Users } from 'lucide-react';
import { whyUs } from '../data/company';
import { img } from '../data/siteConfig';
import { Reveal, SectionHeading } from './Section';

const ICONS = { route: Route, compass: Compass, clipboard: ClipboardCheck, headset: Headphones, heart: HeartHandshake, users: Users };
const TONES = ['bg-saffron/15 text-saffron', 'bg-turq/15 text-turq', 'bg-ocean/10 text-ocean', 'bg-coral/15 text-coral', 'bg-gold/20 text-gold', 'bg-skyblue/15 text-skyblue'];

export default function WhyUs() {
  return (
    <section id="why-us" data-testid="section-why-us" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Why Us"
          title="Why Travel With Prime Journey India?"
          sub="Because a great journey is planned by people who genuinely care where you go."
        />
        <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-[1.02fr_1fr]">
          <Reveal className="relative min-h-[380px] overflow-hidden rounded-[2rem] lg:min-h-full">
            <img
              src={img('1615836245337-f5b9b2303f10', 1400)}
              alt="Udaipur City Palace rising above Lake Pichola"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <p className="font-editorial text-2xl italic leading-snug text-white sm:text-3xl">
                "We plan the way we would for our own family."
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">The Prime Journey promise</p>
            </div>
          </Reveal>

          <div className="grid content-center gap-x-8 gap-y-9 sm:grid-cols-2">
            {whyUs.map((w, i) => {
              const Icon = ICONS[w.icon];
              return (
                <Reveal key={w.title} delay={(i % 2) * 0.1} testid={`why-${w.icon}`}>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${TONES[i % TONES.length]}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-ocean">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{w.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
