// Returns the base URL for API calls (REST and SSE)
// In dev: '' (relative, proxied by Vite)
// In prod: VITE_API_URL env var (e.g. https://erp-backend.up.railway.app)
export const API_ORIGIN = import.meta.env.VITE_API_URL || '';

// For SSE fetch() calls that need full path
export const apiUrl = (path) => `${API_ORIGIN}${path}`;
