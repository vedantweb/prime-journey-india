import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { Reveal, SectionHeading } from './Section';

export default function Contact() {
  return (
    <section id="contact" data-testid="section-contact" className="bg-cloud py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Visit Us"
          title="Visit Our Office"
          sub="In Amritsar for a cup of chai? Drop by — journey planning is always better in person."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="h-[320px] overflow-hidden rounded-3xl border border-ocean/10 shadow-[0_16px_50px_rgba(6,24,43,0.1)] sm:h-[420px]">
              <iframe
                data-testid="office-map"
                title="Prime Journey India office map"
                src={siteConfig.mapEmbed}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-8 rounded-3xl bg-ocean p-8 text-white sm:p-10">
              <div>
                <div className="flex items-start gap-3.5">
                  <MapPin size={20} className="mt-1 shrink-0 text-gold" />
                  <address className="not-italic text-sm leading-relaxed text-white/85">
                    {siteConfig.address.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </address>
                </div>
                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm">
                  <a data-testid="contact-phone" href={siteConfig.phoneHref} className="flex items-center gap-3 text-white/85 transition-colors duration-200 hover:text-gold">
                    <Phone size={16} className="text-gold" /> {siteConfig.phone}
                  </a>
                  <a data-testid="contact-email" href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 break-all text-white/85 transition-colors duration-200 hover:text-gold">
                    <Mail size={16} className="shrink-0 text-gold" /> {siteConfig.email}
                  </a>
                  <a data-testid="contact-bookings" href={`mailto:${siteConfig.bookingsEmail}`} className="flex items-center gap-3 break-all text-white/85 transition-colors duration-200 hover:text-gold">
                    <Mail size={16} className="shrink-0 text-gold" /> {siteConfig.bookingsEmail}
                  </a>
                </div>
              </div>
              <a
                data-testid="btn-directions"
                href={siteConfig.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-arrow group flex items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-display text-sm font-bold text-ocean-deep transition-colors duration-300 hover:bg-saffron"
              >
                Get Directions <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
