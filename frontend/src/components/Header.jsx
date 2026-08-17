import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, User, X } from 'lucide-react';
import Logo from './Logo';
import { navLinks } from '../data/siteConfig';
import { useUI } from '../context/UIContext';

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, openAuth, openBooking } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (target) => {
    setOpen(false);
    if (target.startsWith('/')) {
      navigate(target);
      return;
    }
    if (location.pathname !== '/') navigate('/', { state: { scrollTo: target } });
    else scrollToId(target);
  };

  return (
    <header
      data-testid="main-header"
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled ? 'border-ocean/10 bg-white/90 shadow-[0_8px_30px_rgba(6,24,43,0.08)] backdrop-blur-xl' : 'border-transparent bg-white/70 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button data-testid="nav-home" onClick={() => go('/')} className="shrink-0" aria-label="Prime Journey India home">
          <Logo />
        </button>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navLinks.map((l) => (
            <button
              key={l.label}
              data-testid={`nav-${l.label.toLowerCase()}`}
              onClick={() => go(l.target)}
              className={`link-underline font-body text-[13.5px] font-semibold tracking-wide text-ocean/80 transition-colors duration-200 hover:text-ocean ${
                l.target === '/about' && location.pathname === '/about' ? 'active text-ocean' : ''
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <button
              data-testid="btn-profile"
              onClick={() => openAuth('profile')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean font-display text-sm font-bold text-white transition-transform duration-200 hover:scale-105"
              aria-label="Your profile"
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              data-testid="btn-login"
              onClick={() => openAuth('login')}
              className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold text-ocean transition-colors duration-200 hover:bg-ocean/5 sm:flex"
            >
              <User size={15} /> Login
            </button>
          )}
          <button
            data-testid="btn-book-now"
            onClick={() => openBooking()}
            className="btn-arrow group flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-[13.5px] font-bold text-ocean-deep shadow-[0_6px_18px_rgba(255,153,51,0.4)] transition-colors duration-300 hover:bg-coral hover:text-white sm:px-5"
          >
            Book Now <ArrowRight size={15} />
          </button>
          <button
            data-testid="btn-mobile-menu"
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-ocean transition-colors duration-200 hover:bg-ocean/5 lg:hidden"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            data-testid="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ocean/10 bg-white/95 backdrop-blur-xl lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col px-6 py-4">
              {navLinks.map((l, i) => (
                <button
                  key={l.label}
                  data-testid={`nav-mobile-${l.label.toLowerCase()}`}
                  onClick={() => go(l.target)}
                  className="border-b border-ocean/5 py-3.5 text-left font-display text-base font-bold text-ocean"
                  style={{ transitionDelay: `${i * 20}ms` }}
                >
                  {l.label}
                </button>
              ))}
              {!user && (
                <button
                  data-testid="btn-login-mobile"
                  onClick={() => { setOpen(false); openAuth('login'); }}
                  className="py-3.5 text-left font-display text-base font-bold text-saffron"
                >
                  Login
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
