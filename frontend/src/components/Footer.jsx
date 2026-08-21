import { useLocation, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Logo from './Logo';
import { siteConfig } from '../data/siteConfig';
import { scrollToId } from './Header';
import { useUI } from '../context/UIContext';

function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  const { openFeedback, openBooking, openLegal } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const go = (target) => {
    if (target === 'feedback') return openFeedback();
    if (target.startsWith('/')) navigate(target);
    else if (location.pathname !== '/') navigate('/', { state: { scrollTo: target } });
    else scrollToId(target);
  };

  const cols = [
    {
      title: 'Explore',
      links: [
        { label: 'Destinations', onClick: () => go('destinations'), testid: 'footer-destinations' },
        { label: 'Holidays', onClick: () => go('holidays'), testid: 'footer-holidays' },
        { label: 'Experiences', onClick: () => go('experiences'), testid: 'footer-experiences' },
        { label: 'Packages', onClick: () => go('packages'), testid: 'footer-packages' },
        { label: 'Customize', onClick: () => go('customize'), testid: 'footer-customize' },
      ],
    },
    {
      title: 'Popular India',
      links: ['Kashmir', 'Rajasthan', 'Amritsar', 'Himachal', 'Kerala', 'Goa', 'Northeast'].map((d) => ({
        label: d,
        onClick: () => navigate(`/destinations/${d.toLowerCase()}`),
        testid: `footer-dest-${d.toLowerCase()}`,
      })),
    },
    {
      title: 'Company',
      links: [
        { label: 'About', onClick: () => go('/about'), testid: 'footer-about' },
        { label: 'Contact', onClick: () => go('contact'), testid: 'footer-contact' },
        { label: 'Feedback', onClick: () => go('feedback'), testid: 'footer-feedback' },
        { label: 'Book Now', onClick: () => openBooking(), testid: 'footer-book' },
        { label: 'Admin', onClick: () => go('/admin'), testid: 'footer-admin' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'WhatsApp', href: siteConfig.whatsapp.url, testid: 'footer-whatsapp' },
        { label: 'Email Us', href: `mailto:${siteConfig.email}`, testid: 'footer-email' },
        { label: 'Bookings Desk', href: `mailto:${siteConfig.bookingsEmail}`, testid: 'footer-bookings' },
        { label: 'Our Office', onClick: () => go('contact'), testid: 'footer-office' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', onClick: () => openLegal('privacy'), testid: 'footer-privacy' },
        { label: 'Terms', onClick: () => openLegal('terms'), testid: 'footer-terms' },
        { label: 'Cancellation Policy', onClick: () => openLegal('cancellation'), testid: 'footer-cancellation' },
      ],
    },
  ];

  const socials = [
    { label: 'Instagram', href: siteConfig.social.instagram, Icon: Instagram, testid: 'social-instagram' },
    siteConfig.social.facebook && { label: 'Facebook', href: siteConfig.social.facebook, Icon: Facebook, testid: 'social-facebook' },
    siteConfig.social.x && { label: 'X', href: siteConfig.social.x, Icon: XIcon, testid: 'social-x' },
    siteConfig.social.youtube && { label: 'YouTube', href: siteConfig.social.youtube, Icon: Youtube, testid: 'social-youtube' },
  ].filter(Boolean);

  return (
    <footer data-testid="footer" className="bg-ocean-deep text-white/70">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Handcrafted Indian journeys — planned honestly, delivered warmly, and supported by real people from first
              call to journey home.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ label, href, Icon, testid }) => (
                <a
                  key={label}
                  data-testid={testid}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-[background-color,color,border-color] duration-300 hover:border-saffron hover:bg-saffron hover:text-ocean-deep"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
            <a
              data-testid="footer-homeease"
              href={siteConfig.sisterBrand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-w-[465px] items-center gap-2 rounded-full border border-gold/40 px-5 py-3 text-xs font-bold text-gold transition-colors duration-300 hover:bg-gold hover:text-ocean-deep sm:min-w-[500px]"
            >
              <span className="flex flex-col items-start text-left">
  <span className="font-display text-xl font-extrabold whitespace-nowrap text-gold sm:text-2xl">{siteConfig.sisterBrand.name}</span>
  <span className="mt-2 whitespace-nowrap text-xs font-medium leading-relaxed text-white/70 sm:text-sm">
    Our sister venture for trusted household staffing & home services in Amritsar.
  </span>
</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="font-body text-[13px] font-extrabold uppercase tracking-[0.2em] text-white">{col.title}</h4>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href ? (
                        <a data-testid={l.testid} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm transition-colors duration-200 hover:text-gold">
                          {l.label}
                        </a>
                      ) : (
                        <button data-testid={l.testid} onClick={l.onClick} className="text-sm transition-colors duration-200 hover:text-gold">
                          {l.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-7 text-center text-xs">
          <p className="mt-2 text-sm font-semibold">
            © 2026 Prime Journey INDIA. All Rights Reserved. · Website by{' '}
            <a data-testid="footer-credit" href={siteConfig.credit.url} target="_blank" rel="noopener noreferrer" className="font-bold text-gold transition-colors duration-200 hover:text-saffron">
              {siteConfig.credit.label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
