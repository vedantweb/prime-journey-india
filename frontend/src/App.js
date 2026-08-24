import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Toaster } from 'sonner';
import { UIProvider } from './context/UIContext';
import UtilityBar from './components/UtilityBar';
import Header from './components/Header';
import Footer from './components/Footer';
import ContactRail from './components/ContactRail';
import BookingModal from './components/BookingModal';
import FeedbackModal from './components/FeedbackModal';
import LegalModal from './components/LegalModal';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import DestinationDetail from './pages/DestinationDetail';
import PackageDetail from './pages/PackageDetail';

function ScrollManager() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (!state?.scrollTo) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, state]);
  return null;
}

function LenisRoot() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;

    const existing = document.getElementById('prime-journey-structured-data');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'prime-journey-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'Prime Journey India',
      url: 'https://primejourneyindia.com/',
      telephone: '+91 8699913245',
      email: 'contact@primejourneyindia.com',
      description: 'Travel agency in Amritsar offering customized India tours and holiday packages.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Baba Deep Singh Avenue, Near Punjab National Bank, Nangli Branch',
        addressLocality: 'Amritsar',
        addressRegion: 'Punjab',
        postalCode: '143001',
        addressCountry: 'IN'
      },
      areaServed: 'India',
      priceRange: '₹₹',
      sameAs: [
        'https://www.instagram.com/primejourneyindia/'
      ]
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [isAdmin]);
  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <LenisRoot />
      <ScrollManager />
      <UtilityBar />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      <ContactRail />
      <BookingModal />
      <FeedbackModal />
      <LegalModal />
      <Toaster richColors position="top-center" />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <Shell />
      </UIProvider>
    </BrowserRouter>
  );
}
