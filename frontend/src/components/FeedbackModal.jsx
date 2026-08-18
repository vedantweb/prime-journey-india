import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Send } from 'lucide-react';
import Modal from './Modal';
import { Field } from './Customize';
import { enquiryService } from '../services/mockService';
import { useUI } from '../context/UIContext';

const inputCls =
  'w-full rounded-xl border border-ocean/15 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-saffron focus:ring-4 focus:ring-saffron/15 placeholder:text-ink/35';

export default function FeedbackModal() {
  const { feedbackOpen, closeFeedback } = useUI();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!data.name || !data.phone || !data.email || !data.message) {
      toast.error('Please enter your name, phone, email and feedback.');
      return;
    }
    setBusy(true);
    try {
      const res = await enquiryService.send({ type: 'Feedback', ...data });
      setSent(res);
      toast.success('Thank you — your feedback is with our team.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={feedbackOpen} onClose={() => { closeFeedback(); setSent(null); }} testid="feedback-modal">
      <div className="p-7 sm:p-9">
        {sent ? (
          <div data-testid="feedback-success" className="flex flex-col items-center py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-turq/15">
              <CheckCircle2 size={34} className="text-turq" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-bold text-ocean">Thank you.</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
              Your feedback (ref <strong className="text-ocean">{sent.id}</strong>) helps us make every journey better.
            </p>
            <button
              data-testid="feedback-done"
              onClick={() => { closeFeedback(); setSent(null); }}
              className="mt-7 rounded-full bg-ocean px-8 py-3 font-body text-sm font-bold text-white transition-colors duration-300 hover:bg-saffron hover:text-ocean-deep"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-saffron">Feedback</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-ocean">How was your experience?</h3>
            <p className="mt-1.5 text-sm text-ink/55"> travelled with us, or just browsing — we read every word.</p>
            <form data-testid="feedback-form" onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name *" testid="ffield-name">
                  <input
                    name="name"
                    data-testid="feedback-name"
                    required
                    placeholder="Your name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Phone *" testid="ffield-phone">
                  <input
                    name="phone"
                    type="tel"
                    data-testid="feedback-phone"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className={inputCls}
                  />
                </Field>

                <Field label="Email *" testid="ffield-email">
                  <input
                    name="email"
                    type="email"
                    data-testid="feedback-email"
                    required
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Your Feedback" testid="ffield-message">
                <textarea name="message" rows="4" data-testid="feedback-message" placeholder="Tell us what you loved, or what we could do better…" className={`${inputCls} resize-none`} />
              </Field>
              <button
                data-testid="feedback-submit"
                type="submit"
                disabled={busy}
                className="btn-arrow group flex items-center justify-center gap-2 rounded-full bg-saffron py-3.5 font-body text-sm font-bold text-ocean-deep transition-colors duration-300 hover:bg-coral hover:text-white disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Share Feedback'} <Send size={14} />
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
