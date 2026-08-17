import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LogOut, MailCheck } from 'lucide-react';
import Modal from './Modal';
import { Field } from './Customize';
import { authService, enquiryService } from '../services/mockService';
import { useUI } from '../context/UIContext';

const inputCls =
  'w-full rounded-xl border border-ocean/15 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-saffron focus:ring-4 focus:ring-saffron/15 placeholder:text-ink/35';

export default function AuthModal() {
  const { auth, closeAuth, openAuth, user, setUser, logout } = useUI();
  const [mode, setMode] = useState(auth.mode);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (auth.open) {
      setMode(auth.mode);
      setResetSent(false);
    }
  }, [auth.open, auth.mode]);

  const run = async (fn, success) => {
    setBusy(true);
    try {
      await fn();
      success?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onLogin = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    run(
      () => authService.login(d).then((u) => { setUser(u); toast.success(`Welcome back, ${u.name.split(' ')[0]}.`); closeAuth(); })
    );
  };

  const onSignup = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    if (d.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    run(
      () => authService.signup(d).then((u) => { setUser(u); toast.success(`Welcome to Prime Journey India, ${u.name.split(' ')[0]}.`); closeAuth(); })
    );
  };

  const onForgot = (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    run(() => authService.requestReset(d.email).then(() => setResetSent(true)));
  };

  const myEnquiries = user ? enquiryService.list().filter((x) => x.email === user.email) : [];

  return (
    <Modal open={auth.open} onClose={closeAuth} testid="auth-modal">
      <div className="p-7 sm:p-9">
        {mode === 'profile' && user ? (
          <div data-testid="auth-profile">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean font-display text-2xl font-extrabold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
              <div>
                <h3 className="font-display text-xl font-extrabold text-ocean">{user.name}</h3>
                <p className="text-sm text-ink/55">{user.email}</p>
              </div>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-4 rounded-2xl bg-cloud p-5 text-sm">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-ink/45">Phone</dt>
                <dd className="mt-1 font-semibold text-ocean">{user.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-ink/45">Member Since</dt>
                <dd className="mt-1 font-semibold text-ocean">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-ink/45">My Enquiries</dt>
                <dd data-testid="profile-enquiry-count" className="mt-1 font-semibold text-ocean">{myEnquiries.length} journey{myEnquiries.length === 1 ? '' : 's'} with us</dd>
              </div>
            </dl>
            <button
              data-testid="btn-logout"
              onClick={() => { logout(); closeAuth(); toast.success('Signed out. See you soon.'); }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-ocean/20 py-3.5 font-display text-sm font-bold text-ocean transition-colors duration-300 hover:border-coral hover:bg-coral hover:text-white"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-saffron">Account</p>
            <h3 className="mt-2 font-display text-2xl font-extrabold text-ocean">Reset your password</h3>
            {resetSent ? (
              <div data-testid="forgot-success" className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-turq/10 p-6">
                <MailCheck size={30} className="text-turq" />
                <p className="text-sm leading-relaxed text-ink/70">
                  If this email is registered, a reset link is on its way. Check your inbox in a few minutes.
                </p>
              </div>
            ) : (
              <form data-testid="forgot-form" onSubmit={onForgot} className="mt-6 flex flex-col gap-4">
                <Field label="Email" testid="ffield-email">
                  <input name="email" type="email" required data-testid="forgot-email" placeholder="you@email.com" className={inputCls} />
                </Field>
                <button data-testid="forgot-submit" disabled={busy} className="rounded-full bg-ocean py-3.5 font-display text-sm font-bold text-white transition-colors duration-300 hover:bg-saffron hover:text-ocean-deep disabled:opacity-60">
                  {busy ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
            <button data-testid="forgot-back" onClick={() => setMode('login')} className="mt-5 text-sm font-bold text-saffron transition-colors duration-200 hover:text-coral">
              Back to login
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-saffron">
              {mode === 'login' ? 'Welcome Back' : 'Join Us'}
            </p>
            <h3 className="mt-2 font-display text-2xl font-extrabold text-ocean">
              {mode === 'login' ? 'Login to your account' : 'Create your account'}
            </h3>
            <form
              data-testid={mode === 'login' ? 'login-form' : 'signup-form'}
              onSubmit={mode === 'login' ? onLogin : onSignup}
              className="mt-6 flex flex-col gap-4"
            >
              {mode === 'signup' && (
                <>
                  <Field label="Full Name" testid="sfield-name">
                    <input name="name" required data-testid="signup-name" placeholder="Your full name" className={inputCls} />
                  </Field>
                  <Field label="Phone" testid="sfield-phone">
                    <input name="phone" data-testid="signup-phone" placeholder="+91 …" className={inputCls} />
                  </Field>
                </>
              )}
              <Field label="Email" testid="sfield-email">
                <input name="email" type="email" required data-testid={mode === 'login' ? 'login-email' : 'signup-email'} placeholder="you@email.com" className={inputCls} />
              </Field>
              <Field label="Password" testid="sfield-password">
                <input name="password" type="password" required data-testid={mode === 'login' ? 'login-password' : 'signup-password'} placeholder="••••••••" className={inputCls} />
              </Field>
              <button
                data-testid={mode === 'login' ? 'login-submit' : 'signup-submit'}
                disabled={busy}
                className="rounded-full bg-ocean py-3.5 font-display text-sm font-bold text-white transition-colors duration-300 hover:bg-saffron hover:text-ocean-deep disabled:opacity-60"
              >
                {busy ? 'One moment…' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                data-testid="auth-switch-mode"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-bold text-saffron transition-colors duration-200 hover:text-coral"
              >
                {mode === 'login' ? 'Create an account' : 'Already have an account?'}
              </button>
              {mode === 'login' && (
                <button data-testid="auth-forgot" onClick={() => setMode('forgot')} className="font-semibold text-ink/50 transition-colors duration-200 hover:text-ocean">
                  Forgot password?
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
