import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastReleaseDate = new Date('2026-11-09T00:00:00.000Z');

  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: lastReleaseDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: lastReleaseDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: lastReleaseDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: lastReleaseDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastReleaseDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: lastReleaseDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lastReleaseDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];

  return routes;
}
