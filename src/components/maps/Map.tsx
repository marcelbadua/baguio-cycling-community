'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapProps {
  latitude?: number | null
  longitude?: number | null
  title?: string
  zoom?: number
  height?: number
}

export function Map({
  latitude,
  longitude,
  title,
  zoom = 16,
  height = 320,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (latitude == null || longitude == null) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [longitude, latitude],
      zoom,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    const marker = new maplibregl.Marker({
      color: '#ef4444',
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new maplibregl.Popup().setText(title ?? 'Location')
      )
      .addTo(map)

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (latitude == null || longitude == null) return

    markerRef.current.setLngLat([longitude, latitude])

    if (title) {
      markerRef.current.setPopup(
        new maplibregl.Popup().setText(title)
      )
    }

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom,
      essential: true,
    })
  }, [latitude, longitude, title, zoom])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl border overflow-hidden"
      style={{ height }}
    />
  )
}