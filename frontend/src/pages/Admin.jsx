import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, Inbox, LayoutDashboard, Loader2, Lock, LogOut, Package as PackageIcon, Settings, ShieldCheck } from 'lucide-react';
import { packages } from '../data/packages';
import { destinations, heroSlides } from '../data/destinations';
import { adminService, enquiryService } from '../services/mockService';
import PersonImage from '../components/PersonImage';
import Logo from '../components/Logo';
import { inr } from '../components/PriceCounter';

const inputCls =
  'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white outline-none backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus:border-gold focus:ring-4 focus:ring-gold/15 placeholder:text-white/40';

export default function Admin() {
  const [stage, setStage] = useState('login'); // login | welcome | panel
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminService.me().then((p) => {
      if (p) {
        setProfile(p);
        setStage('welcome');
      }
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (stage !== 'panel') return;
    adminService.overview().then(setOverview).catch(() => {});
    adminService.enquiries().then((d) => setEnquiries(d.enquiries)).catch(() => setEnquiries(enquiryService.list().slice().reverse()));
  }, [stage]);

  const onLogin = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    setBusy(true);
    setError('');
    try {
      const p = await adminService.login(d.alias, d.password);
      setProfile(p);
      setStage('welcome');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onSettings = async () => {
    setTab('settings');
    try {
      await adminService.settings();
      toast.success('Master settings access granted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const signOut = () => {
    adminService.logout();
    setProfile(null);
    setStage('login');
    setTab('overview');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'enquiries', label: 'Enquiries', Icon: Inbox },
    { id: 'packages', label: 'Packages', Icon: PackageIcon },
    { id: 'settings', label: 'Settings', Icon: Settings, masterOnly: true },
  ];

  if (checking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-saffron" size={30} />
      </div>
    );
  }

  return (
    <div data-testid="admin-page" className="min-h-[85vh] bg-cloud">
      <AnimatePresence mode="wait">
        {stage === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-5 py-16">
            <img src={heroSlides[0].image} alt="" className="hero-zoom absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-ocean-deep/70" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-ocean-deep/55 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
            >
              <div className="flex justify-center"><Logo dark /></div>
              <h1 className="mt-7 text-center font-display text-3xl font-bold text-white">Admin Sign In</h1>
              <p className="mt-2 text-center text-xs font-semibold text-white/55">
                Private access for the Prime Journey India team.
              </p>
              <form data-testid="admin-login-form" onSubmit={onLogin} className="mt-7 flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-gold">Admin Alias</span>
                  <input name="alias" data-testid="admin-alias" placeholder="Master@pji.com" autoComplete="username" className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-gold">Password</span>
                  <input name="password" type="password" data-testid="admin-password" placeholder="••••••••" autoComplete="current-password" className={inputCls} />
                </label>
                {error && <p data-testid="admin-login-error" className="rounded-xl bg-coral/15 px-4 py-3 text-center text-xs font-bold text-coral">{error}</p>}
                <button
                  data-testid="admin-login-submit"
                  disabled={busy}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-saffron py-3.5 font-body text-sm font-bold text-ocean-deep transition-colors duration-300 hover:bg-gold disabled:opacity-60"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />} {busy ? 'Verifying…' : 'Sign In Securely'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {stage === 'welcome' && profile && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
            <img src={heroSlides[2].image} alt="" className="hero-zoom absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-ocean-deep/75 via-ocean-deep/60 to-ocean-deep/85" />
            <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative">
              <PersonImage
                imageKey={profile.imageKey}
                initials={profile.displayName.split(' ').map((w) => w[0]).slice(-2).join('')}
                tone="gold"
                size="h-28 w-28"
                text="text-3xl"
                testid="admin-welcome-avatar"
              />
              <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.35em] text-gold">{profile.roleLabel}</p>
              <h1 data-testid="admin-greeting" className="mt-3 font-display text-4xl font-bold text-white text-shadow-hero sm:text-5xl">
                {profile.greeting}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
                Your panel is ready — enquiries, packages and content are waiting.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <button
                  data-testid="admin-enter"
                  onClick={() => setStage('panel')}
                  className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-8 py-3.5 font-body text-sm font-bold text-ocean-deep shadow-[0_10px_26px_rgba(255,153,51,0.4)] transition-colors duration-300 hover:bg-gold"
                >
                  Enter Admin Panel <ArrowRight size={15} />
                </button>
                <button data-testid="admin-signout-welcome" onClick={signOut} className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/10">
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {stage === 'panel' && profile && (
          <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Logo compact />
                <span className="font-display text-lg font-bold text-ocean">Admin Panel</span>
              </div>
              <div className="flex items-center gap-3.5">
                <div data-testid="admin-identity" className="flex items-center gap-3 rounded-full bg-cloud py-1.5 pl-1.5 pr-4">
                  <PersonImage
                    imageKey={profile.imageKey}
                    initials={profile.displayName.split(' ').map((w) => w[0]).slice(-2).join('')}
                    tone="gold"
                    size="h-9 w-9"
                    text="text-xs"
                    testid="admin-panel-avatar"
                    rounded="rounded-full"
                  />
                  <span className="leading-tight">
                    <span className="block text-[13px] font-extrabold text-ocean">{profile.displayName}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-saffron">{profile.roleLabel}</span>
                  </span>
                </div>
                <button data-testid="admin-exit" onClick={signOut} className="flex items-center gap-2 rounded-full border border-ocean/15 px-4 py-2.5 text-xs font-bold text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
                  <LogOut size={13} /> Exit
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
              <nav data-testid="admin-nav" className="flex gap-2 overflow-x-auto rounded-3xl bg-white p-4 shadow-sm lg:flex-col">
                {tabs.map(({ id, label, Icon, masterOnly }) => (
                  <button
                    key={id}
                    data-testid={`admin-nav-${id}`}
                    onClick={() => (id === 'settings' ? onSettings() : setTab(id))}
                    className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors duration-200 ${
                      tab === id ? 'bg-ocean text-white' : 'text-ink/55 hover:bg-cloud'
                    }`}
                  >
                    <Icon size={16} /> {label}
                    {masterOnly && profile.role !== 'master' && <Lock size={11} className="ml-auto opacity-50" />}
                  </button>
                ))}
              </nav>

              <div className="flex flex-col gap-6">
                {tab === 'overview' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Total Enquiries', value: overview?.enquiries ?? '—', testid: 'stat-enquiries' },
                      { label: 'Feedback Received', value: overview?.feedback ?? '—', testid: 'stat-feedback' },
                      { label: 'Live Packages', value: packages.length, testid: 'stat-packages' },
                      { label: 'Destinations', value: destinations.length, testid: 'stat-destinations' },
                    ].map((s) => (
                      <div key={s.label} data-testid={s.testid} className="rounded-3xl bg-white p-6 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{s.label}</p>
                        <p className="mt-2 font-display text-3xl font-bold text-ocean">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'enquiries' && (
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="font-display text-xl font-bold text-ocean">Enquiries & Feedback</h2>
                    {enquiries.length === 0 ? (
                      <p data-testid="admin-empty" className="mt-4 rounded-2xl bg-cloud p-6 text-sm text-ink/55">
                        Nothing yet — new website enquiries and feedback appear here in real time.
                      </p>
                    ) : (
                      <div className="mt-4 overflow-x-auto">
                        <table data-testid="admin-enquiry-table" className="w-full min-w-[640px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-ocean/10 text-[11px] uppercase tracking-widest text-ink/45">
                              <th className="pb-3 pr-4 font-bold">Ref</th>
                              <th className="pb-3 pr-4 font-bold">Name</th>
                              <th className="pb-3 pr-4 font-bold">Type</th>
                              <th className="pb-3 pr-4 font-bold">Destination / Package</th>
                              <th className="pb-3 pr-4 font-bold">Received</th>
                              <th className="pb-3 font-bold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enquiries.map((e) => (
                              <tr key={e.id} className="border-b border-ocean/5 last:border-0">
                                <td className="py-3.5 pr-4 font-bold text-ocean">{e.id}</td>
                                <td className="py-3.5 pr-4 font-semibold">{e.name || '—'}</td>
                                <td className="py-3.5 pr-4 text-ink/60">{e.type}</td>
                                <td className="py-3.5 pr-4 text-ink/60">{e.destination || e.package || '—'}</td>
                                <td className="py-3.5 pr-4 text-ink/60">{new Date(e.created_at || e.createdAt).toLocaleDateString('en-IN')}</td>
                                <td className="py-3.5"><span className="rounded-full bg-saffron/15 px-3 py-1 text-[11px] font-extrabold text-saffron">{e.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'packages' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {packages.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
                        <img src={p.image} alt={p.alt} className="h-16 w-20 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg font-bold text-ocean">{p.name}</p>
                          <p className="text-xs font-semibold text-ink/50">{p.duration} · {inr(p.priceTo)}</p>
                        </div>
                        <Compass size={16} className="text-turq" />
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'settings' && (
                  <div className="rounded-3xl bg-white p-8 shadow-sm">
                    {profile.role === 'master' ? (
                      <div data-testid="admin-settings-master">
                        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ocean"><ShieldCheck size={20} className="text-turq" /> Master Settings</h2>
                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
                          Roles, admin management, security and site configuration live here. Master Admin holds full access;
                          Founder and Co-Founder admins can manage bookings, feedback, homepage, destinations, packages, images and experiences.
                        </p>
                      </div>
                    ) : (
                      <div data-testid="admin-settings-denied" className="flex items-start gap-3 rounded-2xl bg-coral/10 p-5">
                        <Lock size={18} className="mt-0.5 shrink-0 text-coral" />
                        <p className="text-sm font-semibold text-ink/70">
                          Settings are restricted to the Master Admin. Your operational areas — bookings, feedback, homepage, destinations, packages, images and experiences — remain fully available.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
