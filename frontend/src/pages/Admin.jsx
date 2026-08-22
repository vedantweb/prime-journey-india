import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, Inbox, LayoutDashboard, Loader2, Lock, LogOut, Package as PackageIcon, Settings, ShieldCheck, Pencil, Save, Image, MessageSquare, Users } from 'lucide-react';
import { packages } from '../data/packages';
import { destinations, heroSlides } from '../data/destinations';
import { adminService, enquiryService } from '../services/mockService';
import PersonImage from '../components/PersonImage';
import Logo from '../components/Logo';
import { inr } from '../components/PriceCounter';

const inputCls =
  'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white outline-none backdrop-blur-sm transition-[border-color,box-shadow] duration-200 focus:border-gold focus:ring-4 focus:ring-gold/15 placeholder:text-white/40';


function EnquiryStatusControls({ enquiry, onUpdated }) {
  const statuses = [
    "Pending",
    "Approved",
    "Rejected",
    "Contacted",
    "In Progress",
    "Completed",
  ];

  const updateStatus = async (status) => {
    try {
      const id = enquiry.id || enquiry._id;

      if (!id) {
        toast.error("This request has no ID.");
        return;
      }

      const saved = await adminService.updateEnquiryStatus(id, status);

      onUpdated(id, saved.status);
      toast.success(`Request marked ${status}`);
    } catch (err) {
      toast.error(err.message || "Could not update status.");
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-ocean/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink/40">
            Request Status
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/45">
            Choose the current stage of this request.
          </p>
        </div>

        <span className="rounded-full bg-ocean/10 px-3 py-1.5 text-[10px] font-extrabold text-ocean">
          {enquiry.status || "New"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => updateStatus(status)}
            className={`rounded-xl border px-3 py-2 text-[10px] font-extrabold transition ${
              enquiry.status === status
                ? "border-ocean bg-ocean text-white"
                : "border-ocean/10 bg-cloud text-ocean hover:bg-ocean/10"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [stage, setStage] = useState('login'); // login | welcome | panel
  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackReply, setFeedbackReply] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [checking, setChecking] = useState(true);
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    leadershipTitle: '',
    leadershipSubtitle: '',
    aboutText: '',
  });
  const [contentSaving, setContentSaving] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packagePrices, setPackagePrices] = useState({});
  const [packageSaving, setPackageSaving] = useState(false);
  const [seasonalOfferPrices, setSeasonalOfferPrices] = useState({ from: 39999, to: 29999 });
  const [seasonalOfferSaving, setSeasonalOfferSaving] = useState(false);
  const [tripImages, setTripImages] = useState([]);
  const [teamPhotos, setTeamPhotos] = useState([]);
  const [teamPhotoUploading, setTeamPhotoUploading] = useState(null);

  const [tripImageUploading, setTripImageUploading] = useState(false);
  const [tripImageTitle, setTripImageTitle] = useState('');



  useEffect(() => {
    adminService.me().then((p) => {
      if (p) {
        setProfile(p);
        setStage(p.mustChangePassword ? 'change-password' : 'welcome');
      }
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (stage !== 'panel') return;
    adminService.overview().then(setOverview).catch(() => {});
    adminService.enquiries().then((d) => setEnquiries(d.enquiries)).catch(() => setEnquiries(enquiryService.list().slice().reverse()));
    adminService.feedback().then((d) => setFeedback(d.feedback || [])).catch(() => setFeedback([]));
    adminService.tripImages()
      .then((d) => setTripImages(d.images || []))
      .catch(() => setTripImages([]));

    adminService.seasonalOffer()
      .then((d) => setSeasonalOfferPrices({
        from: Number(d.price_from),
        to: Number(d.price_to),
      }))
      .catch(() => {});

    adminService.content().then((d) => {
      setContent({
        heroTitle: d.heroTitle || '',
        heroSubtitle: d.heroSubtitle || '',
        leadershipTitle: d.leadershipTitle || '',
        leadershipSubtitle: d.leadershipSubtitle || '',
        aboutText: d.aboutText || '',
      });
    }).catch(() => {});
  }, [stage]);

  const onLogin = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    setBusy(true);
    setError('');
    try {
      const p = await adminService.login(d.alias, d.password);
      setProfile(p);
      setStage(p.mustChangePassword ? 'change-password' : 'welcome');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setBusy(true);

    try {
      await adminService.changePassword(currentPassword, newPassword);

      const updatedProfile = {
        ...profile,
        mustChangePassword: false,
      };

      setProfile(updatedProfile);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStage('welcome');
      toast.success('Password changed successfully.');
    } catch (err) {
      setError(err.message || 'Could not change password.');
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
    { id: 'feedback', label: 'Feedback', Icon: MessageSquare },
    { id: 'packages', label: 'Packages', Icon: PackageIcon },
    { id: 'content', label: 'Website Content', Icon: Pencil },
    { id: 'trip-images', label: 'Trip Images', Icon: Image },
    { id: 'team-photos', label: 'Team Photos', Icon: Users },
    { id: 'settings', label: 'Settings', Icon: Settings },
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
                  <input name="alias" data-testid="admin-alias" placeholder="Enter your admin alias" autoComplete="username" className={inputCls} />
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

        {stage === 'change-password' && profile && (
          <motion.div
            key="change-password"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-5 py-16"
          >
            <img
              src={heroSlides[0].image}
              alt=""
              className="hero-zoom absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-ocean-deep/75" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-ocean-deep/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
            >
              <div className="flex justify-center">
                <Logo dark />
              </div>

              <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-saffron/15 text-gold">
                <ShieldCheck size={28} />
              </div>

              <h1 className="mt-5 text-center font-display text-3xl font-bold text-white">
                Change Your Password
              </h1>

              <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-white/60">
                For security, you must create a new password before entering the admin panel.
              </p>

              <form
                onSubmit={onChangePassword}
                className="mt-7 flex flex-col gap-4"
              >
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-gold">
                    Current Password
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className={inputCls}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-gold">
                    New Password
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={inputCls}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.25em] text-gold">
                    Confirm New Password
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={inputCls}
                  />
                </label>

                {error && (
                  <p className="rounded-xl bg-coral/15 px-4 py-3 text-center text-xs font-bold text-coral">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-saffron py-3.5 font-body text-sm font-bold text-ocean-deep transition-colors duration-300 hover:bg-gold disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {busy ? 'Updating…' : 'Set New Password'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {stage === 'welcome' && profile && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
            <img src={heroSlides.find((slide) => slide.key === "pangong")?.image || heroSlides[2].image} alt="" className="hero-zoom absolute inset-0 h-full w-full object-cover" />
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
                    onClick={() => setTab(id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors duration-200 ${
                      tab === id ? 'bg-ocean text-white' : 'text-ink/55 hover:bg-cloud'
                    }`}
                  >
                    <Icon size={16} /> {label}

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
                  <div className="space-y-5">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h2 className="font-display text-xl font-bold text-ocean">
                            Customer Requests
                          </h2>
                          <p className="mt-1 text-xs font-semibold text-ink/50">
                            Bookings, customised trips and general enquiries.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-ocean/10 px-3 py-1.5 text-[10px] font-extrabold text-ocean">
                            {enquiries.length} Requests
                          </span>
                        </div>
                      </div>
                    </div>

                    {enquiries.length === 0 ? (
                      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                        <Inbox className="mx-auto text-ink/20" size={32} />
                        <p data-testid="admin-empty" className="mt-3 text-sm font-semibold text-ink/45">
                          No customer requests yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                        <div className="divide-y divide-ocean/5">
                          {enquiries
                            .filter((e) => String(e.type || '').toLowerCase() !== 'feedback')
                            .map((e) => {
                            const type = String(e.type || '').toLowerCase();
                            const isBooking = type.includes('booking');
                            const isCustom = type.includes('custom');

                            const label = isBooking
                              ? 'Enquiry'
                              : isCustom
                                ? 'Custom Trip Enquiry'
                                : 'Enquiry';

                            const date = e.created_at || e.createdAt;

                            return (
                              <details
                                key={e.id || e._id}
                                className="group"
                              >
                                <summary className="cursor-pointer list-none px-5 py-4 transition-colors hover:bg-cloud/70">
                                  <div className="grid items-center gap-3 lg:grid-cols-[1.5fr_1fr_1.3fr_1fr_1fr_auto]">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-ocean/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-ocean">
                                          {label}
                                        </span>
                                        <span className="rounded-full bg-saffron/15 px-2.5 py-1 text-[9px] font-extrabold text-saffron">
                                          {e.status || 'New'}
                                        </span>
                                      </div>

                                      <p className="mt-2 truncate font-display text-base font-bold text-ocean">
                                        {e.name || 'Unnamed Traveller'}
                                      </p>

                                      <p className="mt-0.5 text-[10px] font-bold text-ink/35">
                                        {e.id || e._id || '—'}
                                      </p>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Destination
                                      </p>
                                      <p className="mt-1 truncate text-xs font-bold text-ink/70">
                                        {e.destination || '—'}
                                      </p>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Package
                                      </p>
                                      <p className="mt-1 truncate text-xs font-bold text-ink/70">
                                        {e.package || '—'}
                                      </p>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Contact
                                      </p>
                                      <p className="mt-1 truncate text-xs font-bold text-ink/70">
                                        {e.phone || e.email || '—'}
                                      </p>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Received
                                      </p>
                                      <p className="mt-1 truncate text-xs font-bold text-ink/60">
                                        {date
                                          ? new Date(date).toLocaleDateString('en-IN')
                                          : '—'}
                                      </p>
                                    </div>

                                    <div
                                      className="flex items-center justify-end gap-1.5"
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      {[
                                        ["Pending", "Pending"],
                                        ["Approved", "Approved"],
                                        ["Rejected", "Rejected"],
                                      ].map(([status, label]) => (
                                        <button
                                          key={status}
                                          type="button"
                                          title={`Mark ${label}`}
                                          onClick={async (event) => {
                                            event.preventDefault();
                                            event.stopPropagation();

                                            try {
                                              const saved =
                                                await adminService.updateEnquiryStatus(
                                                  e.id || e._id,
                                                  status
                                                );

                                              setEnquiries((current) =>
                                                current.map((item) =>
                                                  (item.id || item._id) ===
                                                  (e.id || e._id)
                                                    ? {
                                                        ...item,
                                                        status: saved.status,
                                                      }
                                                    : item
                                                )
                                              );

                                              toast.success(
                                                `${label}: ${e.id || e._id}`
                                              );
                                            } catch (err) {
                                              toast.error(
                                                err.message ||
                                                  "Could not update status."
                                              );
                                            }
                                          }}
                                          className={`rounded-lg px-2.5 py-2 text-[9px] font-extrabold transition ${
                                            e.status === status
                                              ? status === "Approved"
                                                ? "bg-emerald-600 text-white"
                                                : status === "Rejected"
                                                  ? "bg-red-500 text-white"
                                                  : "bg-saffron text-white"
                                              : "bg-cloud text-ocean hover:bg-ocean/10"
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      ))}

                                      <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-cloud text-ocean transition-transform group-open:rotate-180">
                                        <ArrowRight size={15} className="rotate-90" />
                                      </span>
                                    </div>
                                  </div>
                                </summary>

                                <div className="border-t border-ocean/5 bg-cloud/50 px-5 py-5">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-2xl bg-white p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Name
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-ocean">
                                        {e.name || '—'}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Phone
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-ocean">
                                        {e.phone || '—'}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Email
                                      </p>
                                      <p className="mt-1 break-all text-sm font-bold text-ocean">
                                        {e.email || '—'}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-white p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Destination
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-ocean">
                                        {e.destination || '—'}
                                      </p>
                                    </div>
                                  </div>

                                  {(e.startDate ||
                                    e.endDate ||
                                    e.travelers ||
                                    e.budget ||
                                    e.message ||
                                    e.notes ||
                                    e.requirements) && (
                                    <div className="mt-3 rounded-2xl bg-white p-5">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Request Details
                                      </p>

                                      <div className="mt-3 grid gap-2 text-sm text-ink/70 sm:grid-cols-2 lg:grid-cols-4">
                                        {e.startDate && (
                                          <p><strong>Start:</strong> {e.startDate}</p>
                                        )}
                                        {e.endDate && (
                                          <p><strong>End:</strong> {e.endDate}</p>
                                        )}
                                        {e.travelers && (
                                          <p><strong>Travellers:</strong> {e.travelers}</p>
                                        )}
                                        {e.budget && (
                                          <p><strong>Budget:</strong> {e.budget}</p>
                                        )}
                                      </div>

                                      {(e.message || e.notes || e.requirements) && (
                                        <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-sm leading-relaxed text-ink/70">
                                          {e.message || e.notes || e.requirements}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Current Status
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-ocean">
                                        {e.status || 'New'}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {['Pending', 'Approved', 'Rejected', 'Contacted', 'In Progress', 'Completed'].map((status) => (
                                        <button
                                          key={status}
                                          type="button"
                                          onClick={async (event) => {
                                            event.preventDefault();

                                            try {
                                              const saved = await adminService.updateEnquiryStatus(
                                                e.id || e._id,
                                                status
                                              );

                                              setEnquiries((current) =>
                                                current.map((item) =>
                                                  (item.id || item._id) === (e.id || e._id)
                                                    ? { ...item, status: saved.status }
                                                    : item
                                                )
                                              );

                                              toast.success(`Request marked ${status}.`);
                                            } catch (err) {
                                              toast.error(err.message);
                                            }
                                          }}
                                          className={`rounded-xl px-3 py-2 text-[10px] font-extrabold transition ${
                                            e.status === status
                                              ? 'bg-ocean text-white'
                                              : 'bg-white text-ocean shadow-sm hover:bg-ocean/5'
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-ocean/5 bg-white p-4">
                                  <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">
                                        Update Request
                                      </p>
                                      <p className="mt-1 text-xs font-semibold text-ink/45">
                                        Mark this request as you handle it.
                                      </p>
                                    </div>

                                    <span className="rounded-full bg-saffron/15 px-3 py-1.5 text-[10px] font-extrabold text-saffron">
                                      {e.status || 'New'}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      'Pending',
                                      'Approved',
                                      'Rejected',
                                      'Contacted',
                                      'In Progress',
                                      'Completed',
                                    ].map((status) => (
                                      <button
                                        key={status}
                                        type="button"
                                        onClick={async (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();

                                          try {
                                            const saved =
                                              await adminService.updateEnquiryStatus(
                                                e.id || e._id,
                                                status
                                              );

                                            setEnquiries((current) =>
                                              current.map((item) =>
                                                (item.id || item._id) ===
                                                (e.id || e._id)
                                                  ? {
                                                      ...item,
                                                      status: saved.status,
                                                    }
                                                  : item
                                              )
                                            );

                                            toast.success(
                                              `Marked as ${status}`
                                            );
                                          } catch (err) {
                                            toast.error(err.message);
                                          }
                                        }}
                                        className={`rounded-xl px-3.5 py-2.5 text-[10px] font-extrabold transition ${
                                          (e.status || 'New') === status
                                            ? 'bg-ocean text-white'
                                            : 'bg-cloud text-ocean hover:bg-ocean/10'
                                        }`}
                                      >
                                        {status}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-ocean/5 bg-white p-4">
                                  <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">
                                        Update Request
                                      </p>
                                      <p className="mt-1 text-xs font-semibold text-ink/45">
                                        Mark this request as you handle it.
                                      </p>
                                    </div>

                                    <span className="rounded-full bg-saffron/15 px-3 py-1.5 text-[10px] font-extrabold text-saffron">
                                      {e.status || 'New'}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      'Pending',
                                      'Approved',
                                      'Rejected',
                                      'Contacted',
                                      'In Progress',
                                      'Completed',
                                    ].map((status) => (
                                      <button
                                        key={status}
                                        type="button"
                                        onClick={async (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();

                                          try {
                                            const saved =
                                              await adminService.updateEnquiryStatus(
                                                e.id || e._id,
                                                status
                                              );

                                            setEnquiries((current) =>
                                              current.map((item) =>
                                                (item.id || item._id) ===
                                                (e.id || e._id)
                                                  ? {
                                                      ...item,
                                                      status: saved.status,
                                                    }
                                                  : item
                                              )
                                            );

                                            toast.success(
                                              `Marked as ${status}`
                                            );
                                          } catch (err) {
                                            toast.error(err.message);
                                          }
                                        }}
                                        className={`rounded-xl px-3.5 py-2.5 text-[10px] font-extrabold transition ${
                                          (e.status || 'New') === status
                                            ? 'bg-ocean text-white'
                                            : 'bg-cloud text-ocean hover:bg-ocean/10'
                                        }`}
                                      >
                                        {status}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <EnquiryStatusControls
                                  enquiry={e}
                                  onUpdated={(id, status) => {
                                    setEnquiries((current) =>
                                      current.map((item) =>
                                        (item.id || item._id) === id
                                          ? { ...item, status }
                                          : item
                                      )
                                    );
                                  }}
                                />
                              </details>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'feedback' && (
                  <div className="space-y-5">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="font-display text-xl font-bold text-ocean">
                            Website Feedback
                          </h2>
                          <p className="mt-1 text-sm font-semibold text-ink/50">
                            Feedback received from travellers and website visitors.
                          </p>
                        </div>

                        <span className="rounded-full bg-ocean/10 px-3 py-1.5 text-[10px] font-extrabold text-ocean">
                          {feedback.length} Feedback{feedback.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {feedback.length === 0 ? (
                      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                        <MessageSquare className="mx-auto text-ink/20" size={34} />
                        <p className="mt-4 font-semibold text-ink/50">
                          No feedback received yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                        {feedback.map((item) => {
                          const id = item.id || item._id;
                          const date = item.created_at || item.createdAt;
                          const currentStatus = item.status || 'New';

                          return (
                            <details
                              key={id}
                              className="group border-b border-ocean/5 last:border-0"
                            >
                              <summary className="cursor-pointer list-none px-5 py-5 transition-colors hover:bg-cloud/60">
                                <div className="grid items-center gap-4 lg:grid-cols-[1.2fr_1.4fr_1.8fr_1fr_auto]">

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-full bg-ocean/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-ocean">
                                        Feedback
                                      </span>

                                      <span className="rounded-full bg-saffron/15 px-2.5 py-1 text-[9px] font-extrabold text-saffron">
                                        {currentStatus}
                                      </span>
                                    </div>

                                    <p className="mt-2 truncate font-display text-lg font-bold text-ocean">
                                      {item.name || 'Unnamed Visitor'}
                                    </p>

                                    <p className="mt-0.5 text-[10px] font-bold text-ink/35">
                                      Ref: {id || '—'}
                                    </p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                      Phone
                                    </p>
                                    <p className="mt-1 truncate text-xs font-bold text-ink/70">
                                      {item.phone || '—'}
                                    </p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                      Email
                                    </p>
                                    <p className="mt-1 truncate text-xs font-bold text-ink/70">
                                      {item.email || '—'}
                                    </p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                      Feedback
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-ink/65">
                                      {item.message || item.feedback || item.text || 'No feedback text'}
                                    </p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                      Received
                                    </p>
                                    <p className="mt-1 truncate text-xs font-bold text-ink/60">
                                      {date
                                        ? new Date(date).toLocaleDateString('en-IN')
                                        : '—'}
                                    </p>
                                  </div>

                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cloud text-ocean transition-transform group-open:rotate-180">
                                    <ArrowRight size={15} className="rotate-90" />
                                  </span>
                                </div>
                              </summary>

                              <div className="bg-cloud/50 px-5 pb-5 pt-1">
                                <div className="rounded-2xl bg-white p-5">
                                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/40">
                                    Feedback
                                  </p>

                                  <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-cloud p-4 text-sm leading-relaxed text-ink/75">
                                    {item.message || item.feedback || item.text || '—'}
                                  </p>

                                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-2xl bg-cloud p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Name
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-ocean">
                                        {item.name || '—'}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-cloud p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Phone
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-ocean">
                                        {item.phone || '—'}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl bg-cloud p-4">
                                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink/35">
                                        Email
                                      </p>
                                      <p className="mt-1 break-all text-sm font-bold text-ocean">
                                        {item.email || '—'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                      {['Pending', 'Approved', 'Rejected'].map((status) => (
                                        <button
                                          key={status}
                                          type="button"
                                          onClick={async () => {
                                            try {
                                              const saved =
                                                await adminService.updateEnquiryStatus(
                                                  id,
                                                  status
                                                );

                                              setFeedback((current) =>
                                                current.map((entry) =>
                                                  (entry.id || entry._id) === id
                                                    ? {
                                                        ...entry,
                                                        status: saved.status,
                                                      }
                                                    : entry
                                                )
                                              );

                                              toast.success(`Feedback marked ${status}`);
                                            } catch (err) {
                                              toast.error(
                                                err.message ||
                                                  'Could not update feedback status.'
                                              );
                                            }
                                          }}
                                          className={`rounded-xl px-3 py-2 text-[10px] font-extrabold transition ${
                                            currentStatus === status
                                              ? status === 'Approved'
                                                ? 'bg-emerald-600 text-white'
                                                : status === 'Rejected'
                                                  ? 'bg-red-500 text-white'
                                                  : 'bg-saffron text-white'
                                              : 'bg-cloud text-ocean hover:bg-ocean/10'
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      ))}
                                    </div>

                                    {item.email ? (
                                      <a
                                        href={`mailto:${item.email}&subject=Regarding%20your%20feedback%20-%20Prime%20Journey%20India`}
                                        target="_top"
                                        className="flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-xs font-bold text-white transition hover:bg-saffron hover:text-ocean-deep"
                                      >
                                        <MessageSquare size={14} />
                                        Reply
                                      </a>
                                    ) : (
                                      <span className="flex items-center gap-2 rounded-full bg-ink/10 px-5 py-2.5 text-xs font-bold text-ink/40">
                                        <MessageSquare size={14} />
                                        No Email
                                      </span>
                                    )}
                                  </div>

                                  {replyingTo === id && (
                                    <div className="mt-4 rounded-2xl border border-ocean/10 bg-cloud p-4">
                                      <textarea
                                        rows={3}
                                        value={feedbackReply[id] || ''}
                                        onChange={(event) =>
                                          setFeedbackReply({
                                            ...feedbackReply,
                                            [id]: event.target.value,
                                          })
                                        }
                                        placeholder="Write your reply..."
                                        className="w-full resize-none rounded-2xl border border-ocean/10 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-turq"
                                      />

                                      <div className="mt-3 flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setReplyingTo(null)}
                                          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink/60"
                                        >
                                          Cancel
                                        </button>

                                        <button
                                          type="button"
                                          onClick={async () => {
                                            const text = (feedbackReply[id] || '').trim();

                                            if (!text) {
                                              toast.error('Write a reply first.');
                                              return;
                                            }

                                            try {
                                              await adminService.replyToFeedback(id, text);

                                              const updated =
                                                await adminService.feedback();

                                              setFeedback(updated.feedback || []);
                                              setReplyingTo(null);

                                              toast.success('Reply saved.');
                                            } catch (err) {
                                              toast.error(
                                                err.message || 'Could not save reply.'
                                              );
                                            }
                                          }}
                                          className="rounded-full bg-ocean px-5 py-2 text-xs font-bold text-white"
                                        >
                                          Send Reply
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'packages' && (
                  <div className="space-y-5">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="font-display text-xl font-bold text-ocean">
                            Hero & Seasonal Offer Pricing
                          </h2>
                          <p className="mt-1 text-sm text-ink/50">
                            Control the cut price and final offer price shown on promotional sections.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label>
                          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-ink/45">
                            Cut / Original Price ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={seasonalOfferPrices.from}
                            onChange={(e) =>
                              setSeasonalOfferPrices({
                                ...seasonalOfferPrices,
                                from: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-ocean/10 bg-cloud px-4 py-3 text-sm font-bold text-ocean outline-none focus:border-turq"
                          />
                        </label>

                        <label>
                          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-ink/45">
                            Offer / Final Price ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={seasonalOfferPrices.to}
                            onChange={(e) =>
                              setSeasonalOfferPrices({
                                ...seasonalOfferPrices,
                                to: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-ocean/10 bg-cloud px-4 py-3 text-sm font-bold text-ocean outline-none focus:border-turq"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-2xl bg-cloud p-4">
                        <div>
                          <p className="text-xs font-bold text-ink/45">Preview</p>
                          <p className="mt-1 text-lg font-bold text-ocean">
                            <span className="mr-2 text-sm text-ink/40 line-through">
                              {inr(Number(seasonalOfferPrices.from) || 0)}
                            </span>
                            <span className="text-saffron">
                              {inr(Number(seasonalOfferPrices.to) || 0)}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={seasonalOfferSaving}
                          onClick={async () => {
                            const from = Number(seasonalOfferPrices.from);
                            const to = Number(seasonalOfferPrices.to);

                            if (
                              seasonalOfferPrices.from === "" ||
                              seasonalOfferPrices.to === "" ||
                              seasonalOfferPrices.from == null ||
                              seasonalOfferPrices.to == null
                            ) {
                              toast.info("Offer price is not available yet.");
                              return;
                            }

                            if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < 0) {
                              toast.error("Enter valid prices.");
                              return;
                            }

                            setSeasonalOfferSaving(true);

                            try {
                              const saved = await adminService.updateSeasonalOffer(from, to);

                              setSeasonalOfferPrices({
                                from: Number(saved.price_from),
                                to: Number(saved.price_to),
                              });

                              toast.success("Hero & seasonal offer price updated.");
                            } catch (err) {
                              toast.error(err.message);
                            } finally {
                              setSeasonalOfferSaving(false);
                            }
                          }}
                          className="rounded-full bg-saffron px-5 py-3 text-xs font-bold text-ocean-deep disabled:opacity-50"
                        >
                          {seasonalOfferSaving ? "Saving…" : "Save Offer Price"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <h2 className="font-display text-xl font-bold text-ocean">
                        Hero Section Offers
                      </h2>
                      <p className="mt-1 text-sm text-ink/50">
                        Edit the From and To prices used by promotional offers in the Hero section.
                      </p>

                      <div className="mt-5 space-y-4">
                        {heroSlides.map((slide) => {
                          const linked = packages.find(
                            (pkg) => pkg.id === slide.offerPackage
                          );

                          if (!linked) return null;

                          const current = packagePrices[linked.id] || {
                            from: linked.priceFrom,
                            to: linked.priceTo,
                            saved: linked.saved ?? (linked.priceFrom - linked.priceTo),
                          };

                          return (
                            <div
                              key={slide.key}
                              className="rounded-2xl border border-ocean/10 bg-cloud p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                  <p className="font-display text-base font-bold text-ocean">
                                    {linked.name}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-ink/45">
                                    Hero: {slide.title || slide.key}
                                  </p>
                                </div>

                                <div className="flex items-end gap-3">
                                  <label>
                                    <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-widest text-ink/40">
                                      From ₹
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={current.from}
                                      onChange={(e) =>
                                        setPackagePrices({
                                          ...packagePrices,
                                          [linked.id]: {
                                            ...current,
                                            from: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-32 rounded-xl border border-ocean/10 bg-white px-3 py-2.5 text-sm font-bold text-ocean outline-none focus:border-turq"
                                    />
                                  </label>

                                  <label>
                                    <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-widest text-ink/40">
                                      To ₹
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={current.to}
                                      onChange={(e) =>
                                        setPackagePrices({
                                          ...packagePrices,
                                          [linked.id]: {
                                            ...current,
                                            to: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-32 rounded-xl border border-ocean/10 bg-white px-3 py-2.5 text-sm font-bold text-ocean outline-none focus:border-turq"
                                    />
                                  </label>

                                  <label>
                                    <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-widest text-ink/40">
                                      You Saved ₹
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={current.saved ?? 0}
                                      onChange={(e) =>
                                        setPackagePrices({
                                          ...packagePrices,
                                          [linked.id]: {
                                            ...current,
                                            saved: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-32 rounded-xl border border-ocean/10 bg-white px-3 py-2.5 text-sm font-bold text-ocean outline-none focus:border-turq"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    disabled={packageSaving}
                                    onClick={async () => {
                                      const from = Number(current.from);
                                      const to = Number(current.to);
                                      const savedAmount = Number(current.saved);

                                      if (
                                        current.from === "" ||
                                        current.to === "" ||
                                        current.from == null ||
                                        current.to == null
                                      ) {
                                        toast.info("Package price is not available yet.");
                                        return;
                                      }

                                      if (
                                        !Number.isFinite(from) ||
                                        !Number.isFinite(to) ||
                                        !Number.isFinite(savedAmount) ||
                                        from < 0 ||
                                        to < 0 ||
                                        savedAmount < 0
                                      ) {
                                        toast.error("Enter valid prices.");
                                        return;
                                      }

                                      setPackageSaving(true);

                                      try {
                                        const saved =
                                          await adminService.updatePackagePrice(
                                            linked.id,
                                            from,
                                            to,
                                            savedAmount
                                          );

                                        setPackagePrices({
                                          ...packagePrices,
                                          [linked.id]: {
                                            from: Number(saved.priceFrom),
                                            to: Number(saved.priceTo),
                                            saved: Number(saved.saved ?? 0),
                                          },
                                        });

                                        toast.success(
                                          `${linked.name} Hero price updated.`
                                        );
                                      } catch (err) {
                                        toast.error(err.message);
                                      } finally {
                                        setPackageSaving(false);
                                      }
                                    }}
                                    className="rounded-full bg-saffron px-4 py-2.5 text-xs font-bold text-ocean-deep disabled:opacity-50"
                                  >
                                    {packageSaving ? "Saving…" : "Save"}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 text-xs font-semibold text-ink/45">
                                Preview:
                                <span className="ml-2 line-through">
                                  {inr(Number(current.from) || 0)}
                                </span>
                                <span className="ml-2 font-extrabold text-saffron">
                                  {inr(Number(current.to) || 0)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <h2 className="font-display text-xl font-bold text-ocean">
                        Holiday Packages
                      </h2>
                      <p className="mt-1 text-sm text-ink/50">
                        Edit the price of any package. Changes are saved for the whole website.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {packages.map((p) => {
                        const saved = packagePrices[p.id] || {
                          from: p.priceFrom,
                          to: p.priceTo,
                          saved: p.saved ?? (p.priceFrom - p.priceTo),
                        };

                        const editing = editingPackage === p.id;

                        return (
                          <div
                            key={p.id}
                            className="overflow-hidden rounded-3xl bg-white shadow-sm"
                          >
                            <img
                              src={p.image}
                              alt={p.alt}
                              className="h-40 w-full object-cover"
                            />

                            <div className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-display text-lg font-bold text-ocean">
                                    {p.name}
                                  </h3>
                                  <p className="mt-1 text-xs font-semibold text-ink/50">
                                    {p.duration}
                                  </p>
                                </div>

                                {!editing && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingPackage(p.id)}
                                    className="flex shrink-0 items-center gap-2 rounded-full bg-ocean px-4 py-2.5 text-xs font-bold text-white hover:bg-ocean-deep"
                                  >
                                    <Pencil size={13} />
                                    Edit Price
                                  </button>
                                )}
                              </div>

                              {!editing ? (
                                <div className="mt-4 rounded-2xl bg-cloud p-4">
                                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/40">
                                    Current Price
                                  </p>
                                  <p className="mt-1 font-display text-2xl font-bold text-ocean">
                                    {inr(saved.to)}
                                  </p>
                                  <p className="mt-1 text-xs text-ink/45">
                                    Starting price: {inr(saved.from)}
                                  </p>
                                  <p className="mt-1 text-xs font-extrabold text-saffron">
                                    You Saved: {inr(saved.saved ?? 0)}
                                  </p>
                                </div>
                              ) : (
                                <div className="mt-5 rounded-2xl bg-cloud p-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <label>
                                      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                                        From ₹
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={saved.from}
                                        onChange={(e) =>
                                          setPackagePrices({
                                            ...packagePrices,
                                            [p.id]: {
                                              ...saved,
                                              from: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full rounded-xl border border-ocean/10 bg-white px-3 py-3 text-sm font-bold text-ocean outline-none focus:border-turq"
                                      />
                                    </label>

                                    <label>
                                      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                                        Final ₹
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={saved.to}
                                        onChange={(e) =>
                                          setPackagePrices({
                                            ...packagePrices,
                                            [p.id]: {
                                              ...saved,
                                              to: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full rounded-xl border border-ocean/10 bg-white px-3 py-3 text-sm font-bold text-ocean outline-none focus:border-turq"
                                      />
                                    </label>

                                    <label className="col-span-2">
                                      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                                        You Saved ₹
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={saved.saved ?? 0}
                                        onChange={(e) =>
                                          setPackagePrices({
                                            ...packagePrices,
                                            [p.id]: {
                                              ...saved,
                                              saved: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full rounded-xl border border-ocean/10 bg-white px-3 py-3 text-sm font-bold text-ocean outline-none focus:border-turq"
                                      />
                                    </label>
                                  </div>

                                  <div className="mt-4 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingPackage(null)}
                                      className="rounded-full px-4 py-2.5 text-xs font-bold text-ink/50 hover:bg-white"
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      type="button"
                                      disabled={packageSaving}
                                      onClick={async () => {
                                        const from = Number(saved.from);
                                        const to = Number(saved.to);

                                        if (
                                          !Number.isFinite(from) ||
                                          !Number.isFinite(to) ||
                                          from < 0 ||
                                          to < from
                                        ) {
                                          toast.error("Enter valid prices.");
                                          return;
                                        }

                                        setPackageSaving(true);

                                        try {
                                          await adminService.updatePackagePrice(
                                            p.id,
                                            from,
                                            to
                                          );

                                          setPackagePrices({
                                            ...packagePrices,
                                            [p.id]: { from, to },
                                          });

                                          setEditingPackage(null);
                                          toast.success(
                                            "Package price updated successfully."
                                          );
                                        } catch (err) {
                                          toast.error(err.message);
                                        } finally {
                                          setPackageSaving(false);
                                        }
                                      }}
                                      className="flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-xs font-bold text-ocean-deep disabled:opacity-50"
                                    >
                                      <Save size={13} />
                                      {packageSaving ? "Saving…" : "Save Price"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tab === 'trip-images' && (
                  <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean/10 text-ocean">
                          <Image size={20} />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-bold text-ocean">
                            Trip Images
                          </h2>
                          <p className="mt-1 text-sm text-ink/50">
                            Upload travel photos for the future trip gallery.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl bg-cloud p-5">
                        <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
                          <label>
                            <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-ink/45">
                              Photo Title
                            </span>
                            <input
                              value={tripImageTitle}
                              onChange={(e) => setTripImageTitle(e.target.value)}
                              placeholder="e.g. Kashmir Winter Escape"
                              className="w-full rounded-xl border border-ocean/10 bg-white px-4 py-3 text-sm font-semibold text-ocean outline-none focus:border-turq"
                            />
                          </label>

                          <label>
                            <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-ink/45">
                              Select Photo
                            </span>
                            <input
                              id="trip-image-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="w-full rounded-xl border border-ocean/10 bg-white px-3 py-2.5 text-sm"
                            />
                          </label>

                          <button
                            type="button"
                            disabled={tripImageUploading}
                            onClick={async () => {
                              const input = document.getElementById('trip-image-upload');
                              const file = input?.files?.[0];

                              if (!file) {
                                toast.error('Please select a trip photo first.');
                                return;
                              }

                              setTripImageUploading(true);

                              try {
                                const saved = await adminService.uploadTripImage(
                                  file,
                                  tripImageTitle.trim()
                                );

                                setTripImages((current) => [
                                  saved.image || saved,
                                  ...current,
                                ]);

                                setTripImageTitle('');
                                input.value = '';
                                toast.success('Trip image uploaded successfully.');
                              } catch (err) {
                                toast.error(err.message);
                              } finally {
                                setTripImageUploading(false);
                              }
                            }}
                            className="flex items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 text-xs font-bold text-ocean-deep disabled:opacity-50"
                          >
                            <Image size={14} />
                            {tripImageUploading ? 'Uploading…' : 'Upload Photo'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {tripImages.length === 0 ? (
                        <div className="sm:col-span-2 lg:col-span-3 rounded-3xl bg-white p-10 text-center shadow-sm">
                          <Image className="mx-auto text-ink/20" size={32} />
                          <p className="mt-3 text-sm font-semibold text-ink/45">
                            No trip photos uploaded yet.
                          </p>
                        </div>
                      ) : (
                        tripImages.map((image) => (
                          <div
                            key={image.id || image._id || image.path}
                            className="overflow-hidden rounded-3xl bg-white shadow-sm"
                          >
                            <img
                              src={image.path}
                              alt={image.title || 'Trip photo'}
                              className="h-48 w-full object-cover"
                            />

                            <div className="p-4">
                              <p className="truncate font-display font-bold text-ocean">
                                {image.title || 'Untitled Trip Photo'}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold text-ink/40">
                                Uploaded by {image.uploaded_by || 'Admin'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {tab === 'content' && (
                  <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean/10 text-ocean">
                          <Pencil size={19} />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-bold text-ocean">Website Content</h2>
                          <p className="mt-1 text-xs font-semibold text-ink/50">
                            Edit basic website text. Layout and design remain protected.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="grid gap-6">
                        <label>
                          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
                            Hero Heading
                          </span>
                          <input
                            value={content.heroTitle}
                            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                            className="w-full rounded-2xl border border-ocean/10 bg-cloud px-4 py-3.5 text-sm font-bold text-ocean outline-none focus:border-turq"
                            placeholder="India, Your Way."
                          />
                        </label>

                        <label>
                          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
                            Hero Subheading
                          </span>
                          <textarea
                            rows={3}
                            value={content.heroSubtitle}
                            onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                            className="w-full resize-none rounded-2xl border border-ocean/10 bg-cloud px-4 py-3.5 text-sm font-semibold text-ink outline-none focus:border-turq"
                            placeholder="Your journey starts here..."
                          />
                        </label>

                        <div className="border-t border-ocean/5 pt-6">
                          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-ocean">
                            <Users size={18} className="text-turq" />
                            Leadership Section
                          </h3>

                          <div className="grid gap-5">
                            <label>
                              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
                                Section Heading
                              </span>
                              <input
                                value={content.leadershipTitle}
                                onChange={(e) => setContent({ ...content, leadershipTitle: e.target.value })}
                                className="w-full rounded-2xl border border-ocean/10 bg-cloud px-4 py-3.5 text-sm font-bold text-ocean outline-none focus:border-turq"
                                placeholder="Meet The People Behind Prime Journey India"
                              />
                            </label>

                            <label>
                              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
                                Section Description
                              </span>
                              <textarea
                                rows={3}
                                value={content.leadershipSubtitle}
                                onChange={(e) => setContent({ ...content, leadershipSubtitle: e.target.value })}
                                className="w-full resize-none rounded-2xl border border-ocean/10 bg-cloud px-4 py-3.5 text-sm font-semibold text-ink outline-none focus:border-turq"
                                placeholder="Optional leadership section description"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="border-t border-ocean/5 pt-6">
                          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-ocean">
                            <MessageSquare size={18} className="text-turq" />
                            About Section
                          </h3>

                          <label>
                            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
                              About Introduction
                            </span>
                            <textarea
                              rows={5}
                              value={content.aboutText}
                              onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
                              className="w-full resize-none rounded-2xl border border-ocean/10 bg-cloud px-4 py-3.5 text-sm font-semibold leading-relaxed text-ink outline-none focus:border-turq"
                              placeholder="Write the basic About text..."
                            />
                          </label>
                        </div>

                        <div className="flex justify-end border-t border-ocean/5 pt-5">
                          <button
                            disabled={contentSaving}
                            onClick={async () => {
                              setContentSaving(true);
                              try {
                                const saved = await adminService.updateContent(content);
                                setContent({
                                  heroTitle: saved.heroTitle || '',
                                  heroSubtitle: saved.heroSubtitle || '',
                                  leadershipTitle: saved.leadershipTitle || '',
                                  leadershipSubtitle: saved.leadershipSubtitle || '',
                                  aboutText: saved.aboutText || '',
                                });
                                toast.success('Website content saved successfully.');
                              } catch (err) {
                                toast.error(err.message);
                              } finally {
                                setContentSaving(false);
                              }
                            }}
                            className="flex items-center gap-2 rounded-full bg-ocean px-6 py-3.5 text-sm font-bold text-white transition hover:bg-ocean/90 disabled:opacity-50"
                          >
                            <Save size={16} />
                            {contentSaving ? 'Saving…' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'team-photos' && (
                  <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean/10 text-ocean">
                          <Users size={19} />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-bold text-ocean">
                            Founder & Co-Founder Photos
                          </h2>
                          <p className="mt-1 text-xs font-semibold text-ink/50">
                            Change the leadership photos shown on the website.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      {[
                        {
                          key: 'founder',
                          name: 'Mr. Ramesh Dhir',
                          role: 'Founder / Admin',
                          image: '/images/founder.jpeg',
                        },
                        {
                          key: 'cofounder1',
                          name: 'Mr. Dheeraj Dhir',
                          role: 'Co-Founder / Admin',
                          image: '/images/cofounder1.jpeg',
                        },
                        {
                          key: 'cofounder2',
                          name: 'Mr. Abhishek Dhir',
                          role: 'Co-Founder / Admin',
                          image: '/images/cofounder2.jpeg',
                        },
                      ].map((person) => {
                        const uploaded = teamPhotos?.find(
                          (x) => x.imageKey === person.key
                        );

                        return (
                          <div
                            key={person.key}
                            className="overflow-hidden rounded-3xl bg-white shadow-sm"
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-cloud">
                              <img
                                src={uploaded?.path || person.image}
                                alt={person.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="p-5">
                              <p className="font-display text-lg font-bold text-ocean">
                                {person.name}
                              </p>

                              <p className="mt-1 text-xs font-bold text-ink/45">
                                {person.role}
                              </p>

                              <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-ocean px-4 py-3 text-sm font-bold text-white hover:bg-ocean-deep">
                                {teamPhotoUploading === person.key ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Uploading…
                                  </>
                                ) : (
                                  <>
                                    <Image size={16} />
                                    Change Photo
                                  </>
                                )}

                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="hidden"
                                  disabled={teamPhotoUploading === person.key}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setTeamPhotoUploading(person.key);

                                    try {
                                      await adminService.uploadImage(
                                        person.key,
                                        file
                                      );

                                      const refreshed =
                                        await adminService.images();

                                      setTeamPhotos(
                                        refreshed.images || []
                                      );

                                      toast.success(
                                        `${person.name}'s photo updated successfully.`
                                      );
                                    } catch (err) {
                                      toast.error(
                                        err.message || 'Photo upload failed.'
                                      );
                                    } finally {
                                      setTeamPhotoUploading(null);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>

                              <p className="mt-3 text-center text-[10px] font-semibold text-ink/40">
                                PNG · JPG · WEBP
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tab === 'settings' && (
                  <div className="rounded-3xl bg-white p-8 shadow-sm">
                    <div data-testid="admin-settings-access">
                      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ocean">
                        <Settings size={20} className="text-turq" /> Settings
                      </h2>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
                        Manage your account, website content, team photos and travel media.
                        All Prime Journey India admins have access to these settings.
                      </p>
                    </div>
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
