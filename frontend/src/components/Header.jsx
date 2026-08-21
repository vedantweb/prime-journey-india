import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X, CircleUserRound, MapPinned, Palmtree, Mountain, Luggage, SlidersHorizontal, MessageCircleMore, PhoneCall, Phone, Globe2 } from 'lucide-react';
import Logo from './Logo';
import { navLinks } from '../data/siteConfig';
import { useUI } from '../context/UIContext';

const navIcons = {
  About: CircleUserRound,
  Destinations: MapPinned,
  Holidays: Palmtree,
  Experiences: Mountain,
  Packages: Luggage,
  Customize: SlidersHorizontal,
  Feedback: MessageCircleMore,
  Contact: PhoneCall,
};

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openBooking, openFeedback } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (link) => {
    setOpen(false);
    if (link.action === 'feedback') {
      openFeedback();
      return;
    }
    if (link.target.startsWith('/')) {
      navigate(link.target);
      return;
    }
    if (location.pathname !== '/') navigate('/', { state: { scrollTo: link.target } });
    else scrollToId(link.target);
  };

  return (
    <header
      data-testid="main-header"
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled ? 'border-ocean/10 bg-white/90 shadow-[0_8px_30px_rgba(6,24,43,0.08)] backdrop-blur-xl' : 'border-transparent bg-white/70 backdrop-blur-md'
      }`}
    >


      <div className="flex h-[76px] w-full items-center justify-between px-2 sm:px-4 lg:px-6">
        <button data-testid="nav-home" onClick={() => navigate('/')} className="min-w-0 shrink mr-2" aria-label="Prime Journey India home">
          <Logo compact={false} />
        </button>

        <nav className="hidden items-center gap-6 xl:gap-7 lg:flex" aria-label="Primary">
          {navLinks.map((l) => (
            <button
              key={l.label}
              data-testid={`nav-${l.label.toLowerCase()}`}
              onClick={() => go(l)}
              className={`link-underline group flex items-center gap-1.5 font-body text-[13.5px] font-semibold tracking-wide text-ocean/80 transition-colors duration-200 hover:text-ocean ${
                l.target === '/about' && location.pathname === '/about' ? 'active text-ocean' : ''
              }`}
            >
              {(() => {
                const Icon = navIcons[l.label];
                return Icon ? <Icon size={32} strokeWidth={1.9} className="shrink-0 text-saffron/85 transition-colors duration-200 group-hover:text-saffron" /> : null;
              })()}
              <span>{l.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 pr-0">
          <button
            data-testid="btn-book-now"
            onClick={() => openBooking()}
            className="btn-arrow group flex items-center gap-2 rounded-full bg-saffron px-2 py-2 text-[10px] sm:px-5 sm:py-2.5 sm:text-[13.5px] sm:px-5 sm:py-2.5 sm:text-[13.5px] font-bold text-ocean-deep shadow-[0_6px_18px_rgba(255,153,51,0.4)] transition-colors duration-300 hover:bg-coral hover:text-white sm:px-5"
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
              {navLinks.map((l) => (
                <button
                  key={l.label}
                  data-testid={`nav-mobile-${l.label.toLowerCase()}`}
                  onClick={() => go(l)}
                  className="flex items-center gap-3 border-b border-ocean/5 py-3.5 text-left font-display text-lg font-bold text-ocean last:border-0"
                >
                  {(() => {
                    const Icon = navIcons[l.label];
                    return Icon ? <Icon size={18} strokeWidth={1.8} className="shrink-0 text-ocean/70" /> : null;
                  })()}
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
