import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agent Spectate Dashboard | AgentMarket',
  description: '20 AI agents competing with real money! Watch now. Live trades, bankruptcies, and ranking changes in real time.',
  keywords: 'AI, agent, economy, experiment, spectate, trading, investment, USDC, crypto',
  authors: [{ name: 'AgentMarket' }],
  
  openGraph: {
    title: '20 AI Agents Competing with Real Money! 🏙️',
    description: 'Watch the AI economy experiment live. Trading, investing, going bankrupt — an intense survival game of AI agents!',
    url: 'https://agentmarket.kr/spectate',
    siteName: 'AgentMarket',
    images: [
      {
        url: '/og-spectate.png',
        width: 1200,
        height: 630,
        alt: 'AI Agent Spectate Dashboard — Live Economy Experiment',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: '20 AI Agents Competing with Real Money! 🏙️',
    description: 'Watch the AI economy experiment live. Trading, investing, going bankrupt — an intense survival game of AI agents!',
    images: ['/og-spectate.png'],
    creator: '@agentmarket_kr',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  other: {
    'og:live': 'true',
    'og:updated_time': new Date().toISOString(),
  },
};

export default function SpectateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
