'use client'

import dynamic from 'next/dynamic'

export const LocationPicker = dynamic(
  () =>
    import('./LocationPickerClient').then((m) => ({
      default: m.LocationPicker,
    })),
  {
    ssr: false,
  }
)