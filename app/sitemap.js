import { getAllPublishedSongIds } from '@/lib/song-data';

const BASE = 'https://worshipnamarafiki.org';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const staticPages = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/library`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/languages`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/submit`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  let songs = [];
  try {
    const rows = await getAllPublishedSongIds();
    songs = rows.map((s) => ({
      url: `${BASE}/songs/${s.id}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
  } catch {
    songs = [];
  }

  return [...staticPages, ...songs];
}
