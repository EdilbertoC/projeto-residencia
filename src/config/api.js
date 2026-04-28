const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yuanqfswhberkoevtmfr.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW5xZnN3aGJlcmtvZXZ0bWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQzNjksImV4cCI6MjA3MDUzMDM2OX0.g8Fm4XAvtX46zifBZnYVH4tVuQkqUH6Ia9CXQj4DztQ'

const AUTH_SESSION_KEY = 'mediconnect.auth.session'

export const apiConfig = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${SUPABASE_URL}/functions/v1`,
  supabaseUrl: SUPABASE_URL,
  restUrl: import.meta.env.VITE_SUPABASE_REST_URL || `${SUPABASE_URL}/rest/v1`,
  functionsUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${SUPABASE_URL}/functions/v1`,
  storageUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL || `${SUPABASE_URL}/storage/v1`,
  anonKey: SUPABASE_ANON_KEY,
}

export function apiEndpoint(path, baseUrl = apiConfig.apiUrl) {
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

export function getAuthSession() {
  if (typeof window === 'undefined') return null
  const rawSession = window.sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!rawSession) return null

  try {
    return JSON.parse(rawSession)
  } catch {
    clearAuthSession()
    return null
  }
}

export function saveAuthSession(session) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  }
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(AUTH_SESSION_KEY)
  }
}

export function hasAuthenticatedSession() {
  const session = getAuthSession()
  if (!session?.access_token) return false

  // Validate expiration locally if available
  if (session.expires_at && session.expires_at * 1000 <= Date.now()) {
    clearAuthSession()
    return false
  }

  return true
}

export function getAnonHeaders(extraHeaders = {}) {
  return cleanHeaders({
    apikey: apiConfig.anonKey,
    'Content-Type': 'application/json',
    ...extraHeaders,
  })
}

export function getAuthenticatedHeaders(extraHeaders = {}) {
  const session = getAuthSession()
  const accessToken = session?.access_token

  if (!accessToken) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  return cleanHeaders({
    apikey: apiConfig.anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  })
}

function cleanHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers).filter(([, value]) => value !== undefined && value !== null),
  )
}
