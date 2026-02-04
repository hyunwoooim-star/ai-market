import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Leaderboard from '@/components/landing/Leaderboard';
import HowItWorks from '@/components/landing/HowItWorks';
import AgentProfiles from '@/components/landing/AgentProfiles';
import CTA from '@/components/landing/CTA';
import SubmitAgent from '@/components/landing/SubmitAgent';
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
      <Leaderboard />
      <HowItWorks />
      <AgentProfiles />
      <CTA />
      <SubmitAgent />
      <Footer />
    </>
  );
}
