import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Facebook, Instagram, Mail, MessageCircle, Phone, X, Youtube } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const TONE = {
  whatsapp: 'bg-[#25D366] hover:bg-[#1fb857]',
  phone: 'bg-ocean hover:bg-ocean-soft',
  email: 'bg-saffron hover:bg-coral',
  instagram: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
  facebook: 'bg-[#1877F2] hover:bg-[#0f66d6]',
  x: 'bg-ink hover:bg-black',
  youtube: 'bg-[#FF0000] hover:bg-[#d90000]',
};

export default function ContactRail() {
  const [open, setOpen] = useState(false);
  const { whatsapp, phoneHref, email, social } = siteConfig;

  const items = [
    { key: 'whatsapp', label: 'WhatsApp', href: whatsapp.url, Icon: MessageCircle, primary: true },
    { key: 'phone', label: siteConfig.phone, href: phoneHref, Icon: Phone },
    { key: 'email', label: 'Email us', href: `mailto:${email}`, Icon: Mail },
    { key: 'instagram', label: 'Instagram', href: social.instagram, Icon: Instagram },
    social.facebook && { key: 'facebook', label: 'Facebook', href: social.facebook, Icon: Facebook },
    social.x && { key: 'x', label: 'X', href: social.x, Icon: XIcon },
    social.youtube && { key: 'youtube', label: 'YouTube', href: social.youtube, Icon: Youtube },
  ].filter(Boolean);

  const renderItem = ({ key, label, href, Icon, primary }, i) => (
    <a
      key={key}
      data-testid={`rail-${key}`}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      aria-label={label}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_8px_22px_rgba(6,24,43,0.25)] transition-transform duration-300 hover:scale-110 ${TONE[key]} ${primary ? 'pulse-ring' : ''}`}
      style={{ transitionDelay: `${i * 15}ms` }}
    >
      <Icon size={17} />
      <span className="pointer-events-none absolute right-[52px] whitespace-nowrap rounded-full bg-ocean px-3.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition-[opacity,transform] duration-200 [transform:translateX(6px)] group-hover:opacity-100 group-hover:[transform:translateX(0)]">
        {label}
      </span>
    </a>
  );

  return (
    <>
      {/* desktop vertical rail */}
      <div data-testid="contact-rail" className="fixed right-4 top-[42%] z-[90] hidden -translate-y-1/2 flex-col gap-2.5 md:flex">
        {items.map(renderItem)}
      </div>

      {/* mobile expandable */}
      <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2.5 md:hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-2.5"
            >
              {items.map(renderItem)}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          data-testid="rail-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Contact options"
          className={`pulse-ring flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_30px_rgba(37,211,102,0.45)] transition-colors duration-300 ${open ? 'bg-ocean' : 'bg-[#25D366]'}`}
        >
          {open ? <X size={22} /> : <MessageCircle size={26} />}
        </button>
      </div>
    </>
  );
}
