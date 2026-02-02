import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import FeaturedAgents from '@/components/landing/FeaturedAgents';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedAgents />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}
