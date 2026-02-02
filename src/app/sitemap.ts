import { MetadataRoute } from 'next';
import { AGENTS } from '@/data/agents';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://agentmarket.kr';

  const agentUrls = AGENTS.map((agent) => ({
    url: `${baseUrl}/agents/${agent.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...agentUrls,
  ];
}
