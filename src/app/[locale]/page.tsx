import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import HowItWorks from '@/components/landing/HowItWorks';
import ServiceCategories from '@/components/landing/ServiceCategories';
import FeaturedAgents from '@/components/landing/FeaturedAgents';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <ServiceCategories />
      <FeaturedAgents />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
