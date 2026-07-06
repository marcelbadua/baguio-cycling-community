'use client'

import dynamic from 'next/dynamic'

export const HazardMap = dynamic(
  () =>
    import('./HazardMapClient').then((m) => ({
      default: m.HazardMap,
    })),
  {
    ssr: false,
  }
)