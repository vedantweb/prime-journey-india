import { ClipboardCheck, Compass, Headphones, HeartHandshake, Route, Users } from 'lucide-react';
import { whyUs } from '../data/company';
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
          align="center"
        />
        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.map((w, i) => {
            const Icon = ICONS[w.icon];
            return (
              <Reveal key={w.title} delay={(i % 3) * 0.1} testid={`why-${w.icon}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TONES[i % TONES.length]}`}>
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-extrabold text-ocean">{w.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink/65">{w.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
