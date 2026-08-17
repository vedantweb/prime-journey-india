import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Send } from 'lucide-react';
import Modal from './Modal';
import { Field } from './Customize';
import { destinations } from '../data/destinations';
import { packages } from '../data/packages';
import { enquiryService } from '../services/mockService';
import { useUI } from '../context/UIContext';

const inputCls =
  'w-full rounded-xl border border-ocean/15 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-saffron focus:ring-4 focus:ring-saffron/15 placeholder:text-ink/35';

export default function BookingModal() {
  const { booking, closeBooking, user } = useUI();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  useEffect(() => {
    if (booking.open) setSent(null);
  }, [booking.open]);

  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!data.name || !data.phone) {
      toast.error('Please share your name and phone number.');
      return;
    }
    setBusy(true);
    try {
      const res = await enquiryService.send({ type: 'Booking Enquiry', ...data });
      setSent(res);
      toast.success('Enquiry sent. We will be in touch soon.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={booking.open} onClose={closeBooking} testid="booking-modal" wide>
      <div className="p-7 sm:p-9">
        {sent ? (
          <div data-testid="booking-success" className="flex flex-col items-center py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-turq/15">
              <CheckCircle2 size={34} className="text-turq" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-extrabold text-ocean">Enquiry received.</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
              Reference <strong className="text-ocean">{sent.id}</strong>. A real person from our Amritsar team will
              reach out to you shortly to plan the details.
            </p>
            <button
              data-testid="booking-done"
              onClick={closeBooking}
              className="mt-7 rounded-full bg-ocean px-8 py-3 font-display text-sm font-bold text-white transition-colors duration-300 hover:bg-saffron hover:text-ocean-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-saffron">Book / Enquire</p>
            <h3 className="mt-2 font-display text-2xl font-extrabold text-ocean">
              {booking.preset ? `Plan: ${booking.preset}` : 'Tell us about your trip'}
            </h3>
            <p className="mt-1.5 text-sm text-ink/55">No payment now — this starts a conversation with our team.</p>
            <form data-testid="booking-form" onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" testid="bfield-name">
                <input name="name" data-testid="booking-name" defaultValue={user?.name || ''} placeholder="Your full name" className={inputCls} />
              </Field>
              <Field label="Phone" testid="bfield-phone">
                <input name="phone" data-testid="booking-phone" defaultValue={user?.phone || ''} placeholder="+91 …" className={inputCls} />
              </Field>
              <Field label="Email" testid="bfield-email">
                <input name="email" type="email" data-testid="booking-email" defaultValue={user?.email || ''} placeholder="you@email.com" className={inputCls} />
              </Field>
              <Field label="Destination" testid="bfield-destination">
                <select name="destination" data-testid="booking-destination" className={inputCls} defaultValue="">
                  <option value="" disabled>Choose a destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </Field>
              <Field label="Travel Date" testid="bfield-date">
                <input name="date" type="date" data-testid="booking-date" className={inputCls} />
              </Field>
              <Field label="Travellers" testid="bfield-travellers">
                <input name="travellers" type="number" min="1" data-testid="booking-travellers" placeholder="2" className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Package" testid="bfield-package">
                  <select name="package" data-testid="booking-package" className={inputCls} defaultValue={booking.preset || ''}>
                    <option value="" disabled>Select a package (optional)</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.name}>{p.name} · {p.duration}</option>
                    ))}
                    <option value="Fully Custom">Fully Custom</option>
                  </select>
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Message" testid="bfield-message">
                  <textarea name="message" rows="3" data-testid="booking-message" placeholder="Anything we should know?" className={`${inputCls} resize-none`} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <button
                  data-testid="booking-submit"
                  type="submit"
                  disabled={busy}
                  className="btn-arrow group flex w-full items-center justify-center gap-2 rounded-full bg-saffron py-4 font-display text-sm font-bold text-ocean-deep shadow-[0_10px_26px_rgba(255,153,51,0.4)] transition-colors duration-300 hover:bg-coral hover:text-white disabled:opacity-60"
                >
                  {busy ? 'Sending…' : 'Send Enquiry'} <Send size={15} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
