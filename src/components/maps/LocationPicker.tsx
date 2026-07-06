'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
    latitude?: number
    longitude?: number
    onChange: (lat: number, lng: number) => void
    height?: number
}

export function LocationPicker({
    latitude,
    longitude,
    onChange,
    height = 350,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const markerRef = useRef<maplibregl.Marker | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const initialLng = longitude ?? 120.5960
        const initialLat = latitude ?? 16.4023 // Burnham Park

        const map = new maplibregl.Map({
            container: containerRef.current,
            // style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
            style: 'https://tiles.openfreemap.org/styles/positron',
            center: [initialLng, initialLat],
            zoom: latitude && longitude ? 16 : 14,
        })

        map.addControl(new maplibregl.NavigationControl(), 'top-right')

        mapRef.current = map

        if (latitude && longitude) {
            markerRef.current = createMarker(latitude, longitude)
        }

        map.on('click', (e) => {
            const lat = e.lngLat.lat
            const lng = e.lngLat.lng

            onChange(lat, lng)

            if (!markerRef.current) {
                markerRef.current = createMarker(lat, lng)
            } else {
                markerRef.current.setLngLat([lng, lat])
            }
        })

        function createMarker(lat: number, lng: number) {
            const marker = new maplibregl.Marker({
                draggable: true,
                color: '#ef4444',
            })
                .setLngLat([lng, lat])
                .addTo(map)

            marker.on('dragend', () => {
                const pos = marker.getLngLat()
                onChange(pos.lat, pos.lng)
            })

            return marker
        }

        return () => {
            map.remove()
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current) return
        if (latitude == null || longitude == null) return

        if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({
                draggable: true,
                color: '#ef4444',
            })
                .setLngLat([longitude, latitude])
                .addTo(mapRef.current)

            markerRef.current.on('dragend', () => {
                const pos = markerRef.current!.getLngLat()
                onChange(pos.lat, pos.lng)
            })
        } else {
            markerRef.current.setLngLat([longitude, latitude])
        }

        mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            essential: true,
        })
    }, [latitude, longitude])

    return (
        <div
            ref={containerRef}
            className="w-full overflow-hidden rounded-xl border"
            style={{ height }}
        />
    )
}