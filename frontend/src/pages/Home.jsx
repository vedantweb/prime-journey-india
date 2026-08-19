import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import DiscoverIndia from '../components/DiscoverIndia';
import TornPaperOffer from '../components/TornPaperOffer';
import Packages from '../components/Packages';
import SeasonExplorer from '../components/SeasonExplorer';
import TravelStyles from '../components/TravelStyles';
import Experiences from '../components/Experiences';
import WhyUs from '../components/WhyUs';
import Reviews from '../components/Reviews';
import Leadership from '../components/Leadership';
import HomeEaseBand from '../components/HomeEaseBand';
import Customize from '../components/Customize';
import Contact from '../components/Contact';
import { scrollToId } from '../components/Header';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const target = location.state?.scrollTo;
    if (target) {
      const t = setTimeout(() => scrollToId(target), 350);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  return (
    <>
      <Hero />
      <DiscoverIndia />
      <TornPaperOffer />
      <Packages />
      <SeasonExplorer />
      <TravelStyles />
      <Experiences />
      <WhyUs />
      <Reviews />
      <Leadership />
      <Customize />
      <Contact />
      <HomeEaseBand />
    </>
  );
}
