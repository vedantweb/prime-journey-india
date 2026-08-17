import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, Inbox, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { adminRoles } from '../data/company';
import { packages } from '../data/packages';
import { destinations } from '../data/destinations';
import { enquiryService } from '../services/mockService';
import { MonogramAvatar } from '../components/Leadership';

// Visual admin shell — real role authentication connects after export.
export default function Admin() {
  const [role, setRole] = useState(null);
  const [entered, setEntered] = useState(false);
  const enquiries = role && entered ? enquiryService.list().slice().reverse() : [];

  return (
    <div data-testid="admin-page" className="min-h-[80vh] bg-cloud">
      <AnimatePresence mode="wait">
        {!role && (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-saffron">Prime Journey India · Admin</p>
            <h1 className="mt-3 text-center font-display text-3xl font-extrabold text-ocean sm:text-4xl">Who's signing in?</h1>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-ink/55">
              Demo admin shell — role authentication connects to the production backend after export.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {adminRoles.map((r, i) => (
                <motion.button
                  key={r.id}
                  data-testid={`admin-role-${r.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setRole(r)}
                  className="group flex flex-col items-center rounded-3xl bg-white p-8 shadow-[0_10px_36px_rgba(6,24,43,0.07)] transition-[box-shadow,transform] duration-400 hover:-translate-y-1.5 hover:shadow-[0_22px_56px_rgba(6,24,43,0.14)]"
                >
                  <MonogramAvatar initials={r.initials} tone={r.tone} size="h-20 w-20" text="text-xl" testid={`admin-avatar-${r.id}`} />
                  <span className="mt-5 font-display text-lg font-extrabold text-ocean">{r.label}</span>
                  <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">{r.id === 'master' ? 'Full Access' : 'Admin'}</span>
                  <span className="mt-4 flex items-center gap-1.5 text-xs font-bold text-saffron opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Continue <ArrowRight size={13} />
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {role && !entered && (
          <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 text-center">
            <MonogramAvatar initials={role.initials} tone={role.tone} size="h-28 w-28" text="text-3xl" testid="admin-welcome-avatar" />
            <h1 data-testid="admin-greeting" className="mt-8 font-display text-4xl font-extrabold text-ocean sm:text-5xl">
              {role.greeting}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">
              {enquiries.length} new enquir{enquiries.length === 1 ? 'y' : 'ies'} waiting · {packages.length} packages live · {destinations.length} destinations featured.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button
                data-testid="admin-enter"
                onClick={() => setEntered(true)}
                className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-8 py-3.5 font-display text-sm font-bold text-ocean-deep shadow-[0_10px_26px_rgba(255,153,51,0.4)] transition-colors duration-300 hover:bg-coral hover:text-white"
              >
                Enter Admin Panel <ArrowRight size={15} />
              </button>
              <button data-testid="admin-back" onClick={() => setRole(null)} className="rounded-full border border-ocean/20 px-6 py-3.5 text-sm font-bold text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
                Switch role
              </button>
            </div>
          </motion.div>
        )}

        {role && entered && (
          <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <MonogramAvatar initials={role.initials} tone={role.tone} size="h-12 w-12" text="text-base" testid="admin-panel-avatar" />
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-ocean">{role.greeting}</h1>
                  <p className="text-xs font-semibold text-ink/50">Admin Panel · Demo data layer</p>
                </div>
              </div>
              <button data-testid="admin-exit" onClick={() => { setEntered(false); setRole(null); }} className="flex items-center gap-2 rounded-full border border-ocean/20 px-5 py-2.5 text-xs font-bold text-ocean transition-colors duration-300 hover:bg-ocean hover:text-white">
                <LogOut size={14} /> Exit
              </button>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
              <nav data-testid="admin-nav" className="flex gap-2 overflow-x-auto rounded-3xl bg-white p-4 shadow-sm lg:flex-col">
                {[
                  { Icon: LayoutDashboard, label: 'Overview' },
                  { Icon: Inbox, label: 'Enquiries' },
                  { Icon: Compass, label: 'Packages' },
                  { Icon: Settings, label: 'Settings' },
                ].map(({ Icon, label }, i) => (
                  <span
                    key={label}
                    data-testid={`admin-nav-${label.toLowerCase()}`}
                    className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold ${i === 0 ? 'bg-ocean text-white' : 'text-ink/55'}`}
                  >
                    <Icon size={16} /> {label}
                  </span>
                ))}
              </nav>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Total Enquiries', value: enquiries.length, testid: 'stat-enquiries' },
                    { label: 'Live Packages', value: packages.length, testid: 'stat-packages' },
                    { label: 'Destinations', value: destinations.length, testid: 'stat-destinations' },
                  ].map((s) => (
                    <div key={s.label} data-testid={s.testid} className="rounded-3xl bg-white p-6 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{s.label}</p>
                      <p className="mt-2 font-display text-3xl font-extrabold text-ocean">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="font-display text-lg font-extrabold text-ocean">Latest Enquiries</h2>
                  {enquiries.length === 0 ? (
                    <p data-testid="admin-empty" className="mt-4 rounded-2xl bg-cloud p-6 text-sm text-ink/55">
                      No enquiries yet. Submit one from the Book Now form on the homepage and it will appear here instantly.
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
                              <td className="py-3.5 pr-4 text-ink/60">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                              <td className="py-3.5"><span className="rounded-full bg-saffron/15 px-3 py-1 text-[11px] font-extrabold text-saffron">{e.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
