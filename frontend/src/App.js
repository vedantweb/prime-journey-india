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
