// In dev, use relative URLs so Vite proxies /api to the backend (avoids CORS).
// In production the SPA is served BY the backend (same origin), so relative
// '/api' works with no CORS. Set VITE_API_URL only if you host the API on a
// different domain.
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || '')

export { API_BASE_URL }
