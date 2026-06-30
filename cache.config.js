
// ============================================================
// cache.config.js — Runtime caching strategies
// ============================================================
module.exports = [
  // Google Fonts
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
    handler:    'CacheFirst',
    options: {
      cacheName: 'google-fonts',
      expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
    },
  },
  // Supabase Storage (images)
  {
    urlPattern: /^https:\/\/ddhgkuueqnavjmsgnxys\.supabase\.co\/storage\/.*/i,
    handler:    'StaleWhileRevalidate',
    options: {
      cacheName:  'supabase-images',
      expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
    },
  },
  // Supabase API (network first, fallback to cache)
  {
    urlPattern: /^https:\/\/ddhgkuueqnavjmsgnxys\.supabase\.co\/rest\/.*/i,
    handler:    'NetworkFirst',
    options: {
      cacheName:         'supabase-api',
      networkTimeoutSeconds: 10,
      expiration:        { maxEntries: 100, maxAgeSeconds: 5 * 60 },
    },
  },
  // Static assets
  {
    urlPattern: /\.(?:js|css|woff2?)$/i,
    handler:    'StaleWhileRevalidate',
    options:    { cacheName: 'static-assets' },
  },
  // HTML pages — network first
  {
    urlPattern: /^https?.*/,
    handler:    'NetworkFirst',
    options: {
      cacheName:           'pages',
      networkTimeoutSeconds: 10,
      expiration:          { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
    },
  },
]