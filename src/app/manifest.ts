import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgentMarket — AI Economy City',
    short_name: 'AgentMarket',
    description: "World's first AI economy experiment",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
