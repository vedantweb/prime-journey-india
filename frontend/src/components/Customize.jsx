import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { customizeImage, destinations } from '../data/destinations';
import { enquiryService } from '../services/mockService';
import { Reveal, SectionHeading } from './Section';

const inputCls =
  'w-full rounded-xl border border-ocean/15 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-saffron focus:ring-4 focus:ring-saffron/15 placeholder:text-ink/35';

export const Field = ({ label, children, testid }) => (
  <label className="block" data-testid={testid}>
    <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-ocean/60">{label}</span>
    {children}
  </label>
);

const STYLES = ['Honeymoon', 'Family', 'Luxury', 'Adventure', 'Spiritual', 'Weekend', 'Nature', 'Photography'];
const BUDGETS = ['Under ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];
const HOTELS = ['Comfortable 3★', 'Premium 4★', 'Luxury 5★', 'Heritage / Boutique', 'Houseboat / Unique stays'];

export default function Customize() {
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    if (!data.name || !data.phone || !data.destination || !data.travellers) {
      toast.error('Please enter your name, phone number, destination and number of travellers.');
      return;
    }
    setBusy(true);
    try {
      const res = await enquiryService.send({ type: 'Customize Journey', ...data });
      setSent(res);
      toast.success('Journey request received.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="customize" data-testid="section-customize" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(6,24,43,0.12)] lg:grid-cols-2">
          <div className="relative min-h-[320px]">
            <img src={customizeImage.src} alt={customizeImage.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
              <p className="font-editorial text-2xl italic leading-snug text-white sm:text-3xl">
                "Tell us how you travel.<br />We'll handle everything else."
              </p>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Tailor-made in 24 hours</p>
            </div>
          </div>

          <div className="bg-cloud p-7 sm:p-10">
            <SectionHeading eyebrow="Customize" title="Customize Your Journey" />
            {sent ? (
              <div data-testid="customize-success" className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-turq/30 bg-turq/10 p-7">
                <CheckCircle2 size={34} className="text-turq" />
                <h3 className="font-display text-xl font-extrabold text-ocean">Your journey brief is with us.</h3>
                <p className="text-sm leading-relaxed text-ink/65">
                  Reference <strong className="text-ocean">{sent.id}</strong>. Our travel team will call you to shape the
                  itinerary around your dates and style.
                </p>
                <button
                  data-testid="customize-again"
                  onClick={() => setSent(null)}
                  className="text-sm font-bold text-saffron transition-colors duration-200 hover:text-coral"
                >
                  Plan another journey
                </button>
              </div>
            ) : (
              <form data-testid="customize-form" onSubmit={submit} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name *" testid="field-name">
                  <input
                    name="name"
                    data-testid="input-name"
                    type="text"
                    required
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Phone Number *" testid="field-phone">
                  <input
                    name="phone"
                    data-testid="input-phone"
                    type="tel"
                    required
                    placeholder="Your phone number"
                    className={inputCls}
                  />
                </Field>

                <Field label="Destination *" testid="field-destination">
                  <select name="destination" data-testid="input-destination" required className={inputCls} defaultValue="">
                    <option value="" disabled>Choose a destination</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    <option value="Somewhere else in India">Somewhere else in India</option>
                  </select>
                </Field>
                <Field label="Travel Dates" testid="field-dates">
                  <input name="dates" data-testid="input-dates" type="text" placeholder="e.g. 12 – 19 October" className={inputCls} />
                </Field>
                <Field label="Travellers" testid="field-travellers">
                  <input name="travellers" data-testid="input-travellers" required type="number" min="1" placeholder="2 adults" className={inputCls} />
                </Field>
                <Field label="Travel Style" testid="field-style">
                  <select name="style" data-testid="input-style" className={inputCls} defaultValue="">
                    <option value="" disabled>Pick a style</option>
                    {STYLES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Budget (per person)" testid="field-budget">
                  <select name="budget" data-testid="input-budget" className={inputCls} defaultValue="">
                    <option value="" disabled>Select budget</option>
                    {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Hotel Preference" testid="field-hotel">
                  <select name="hotel" data-testid="input-hotel" className={inputCls} defaultValue="">
                    <option value="" disabled>Select preference</option>
                    {HOTELS.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Special Requests" testid="field-requests">
                    <textarea name="requests" data-testid="input-requests" rows="3" placeholder="Anniversary dinner, wheelchair access, slow mornings…" className={`${inputCls} resize-none`} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <button
                    data-testid="customize-submit"
                    type="submit"
                    disabled={busy}
                    className="btn-arrow group flex w-full items-center justify-center gap-2 rounded-full bg-ocean py-4 font-display text-sm font-bold text-white transition-colors duration-300 hover:bg-saffron hover:text-ocean-deep disabled:opacity-60"
                  >
                    {busy ? 'Sending…' : 'Build My Journey'} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Reveal className="hidden" />
    </section>
  );
}
