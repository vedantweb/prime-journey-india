import { MessageCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function WhatsAppButton() {
  return (
    <a
      data-testid="whatsapp-float"
      href={siteConfig.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp: ${siteConfig.whatsapp.display}`}
      className="pulse-ring group fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:scale-105 sm:bottom-7 sm:right-7"
    >
      <MessageCircle size={26} />
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-full bg-ocean px-4 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-[opacity,transform] duration-300 [transform:translateX(6px)] group-hover:opacity-100 group-hover:[transform:translateX(0)]">
        Chat with us
      </span>
    </a>
  );
}
