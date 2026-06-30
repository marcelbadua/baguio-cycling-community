// ============================================================
// src/hooks/use-local-storage.ts
// ============================================================
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch { return initial }
  })
  const set = (v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      if (typeof window !== 'undefined') {
        try { window.localStorage.setItem(key, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }
  return [value, set] as const
}