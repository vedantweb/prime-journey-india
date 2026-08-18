import { Mail, MapPin, Phone, Instagram, Facebook, ExternalLink, MessageCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#F8F7F3] text-ocean">
      <section className="relative overflow-hidden bg-ocean-deep px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,170,60,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(40,150,255,0.22),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-10 bg-gold" />
            Get in touch
          </p>

          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl">
            Let’s plan your next journey.
          </h1>

          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-white/75 sm:text-xl">
            Talk to Prime Journey India for holidays, customized trips, package enquiries and travel planning.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-ocean-deep p-8 text-white shadow-[0_25px_80px_rgba(6,24,43,0.16)] sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
              Contact details
            </p>

            <div className="mt-8 space-y-6">
              <a href={siteConfig.phoneHref} className="flex items-start gap-4">
                <span className="rounded-2xl bg-white/10 p-3 text-gold">
                  <Phone size={21} />
                </span>
                <span>
                  <span className="block text-sm text-white/55">Phone</span>
                  <span className="mt-1 block font-semibold">{siteConfig.phone}</span>
                </span>
              </a>

              <a
                href={siteConfig.whatsapp.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4"
              >
                <span className="rounded-2xl bg-white/10 p-3 text-gold">
                  <MessageCircle size={21} />
                </span>
                <span>
                  <span className="block text-sm text-white/55">WhatsApp</span>
                  <span className="mt-1 block font-semibold">{siteConfig.whatsapp.display}</span>
                </span>
              </a>

              <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-4">
                <span className="rounded-2xl bg-white/10 p-3 text-gold">
                  <Mail size={21} />
                </span>
                <span>
                  <span className="block text-sm text-white/55">General enquiries</span>
                  <span className="mt-1 block break-all font-semibold">{siteConfig.email}</span>
                </span>
              </a>

              <a href={`mailto:${siteConfig.bookingsEmail}`} className="flex items-start gap-4">
                <span className="rounded-2xl bg-white/10 p-3 text-gold">
                  <Mail size={21} />
                </span>
                <span>
                  <span className="block text-sm text-white/55">Bookings</span>
                  <span className="mt-1 block break-all font-semibold">{siteConfig.bookingsEmail}</span>
                </span>
              </a>

              <div className="flex items-start gap-4">
                <span className="rounded-2xl bg-white/10 p-3 text-gold">
                  <MapPin size={21} />
                </span>
                <span>
                  <span className="block text-sm text-white/55">Office</span>
                  <span className="mt-1 block leading-relaxed font-semibold">
                    {siteConfig.address.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
              >
                <Instagram size={17} /> Instagram
              </a>

              {siteConfig.social.facebook && (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
                >
                  <Facebook size={17} /> Facebook
                </a>
              )}

              {siteConfig.social.x && (
                <a
                  href={siteConfig.social.x}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
                >
                  <span className="text-base font-bold">X</span> X
                </a>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_70px_rgba(6,24,43,0.10)]">
            <div className="h-[430px] w-full sm:h-[520px]">
              <iframe
                title="Prime Journey India office location"
                src={siteConfig.mapEmbed}
                className="h-full w-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-saffron">
                  Visit us
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-ocean">
                  Prime Journey India
                </h2>
              </div>

              <a
                href={siteConfig.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3 font-semibold text-ocean-deep shadow-[0_10px_25px_rgba(255,153,51,0.25)]"
              >
                Get Directions <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
