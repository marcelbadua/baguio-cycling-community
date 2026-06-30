// ============================================================
// src/hooks/use-infinite-scroll.ts
// ============================================================
import { useEffect, useRef } from 'react'

export function useInfiniteScroll(callback: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) callback() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [callback, enabled])
  return ref
}