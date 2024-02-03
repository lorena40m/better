export const NAME_CACHE_KEY = 'NAMES_v2'

export function getCache(key: string): any | null {
  if (!process.env.ENABLE_CACHE) return
  return window[key] ?? JSON.parse(localStorage.getItem(key)) ?? null
}

export function setCache(key: string, cache) {
  if (!process.env.ENABLE_CACHE) return
  localStorage.setItem(key, JSON.stringify(window[key] = cache))
}
