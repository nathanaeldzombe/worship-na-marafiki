export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep the private panel and API out of search results.
        disallow: ['/panel/', '/signin', '/api/'],
      },
    ],
    sitemap: 'https://worshipnamarafiki.org/sitemap.xml',
  };
}
