import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/docs',
          '/changelog',
          '/security',
          '/about',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/api/',
          '/view',
          '/r/',
          '/_next/',
          '/preview',
          '/share',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
