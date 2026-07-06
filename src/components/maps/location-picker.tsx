'use client'

import { useEffect } from 'react'

import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'

import L from './leaflet-icon'

import 'leaflet/dist/leaflet.css'

interface Props {
  latitude?: number
  longitude?: number

  onChange: (lat: number, lng: number) => void

  height?: number
}

function ClickHandler({
  position,
  onChange,
}: {
  position?: [number, number]
  onChange: (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16)
    }
  }, [position, map])

  return null
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = 350,
}: Props) {
  const center: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : [16.4023, 120.5960] // Burnham Park

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler
          position={
            latitude && longitude
              ? [latitude, longitude]
              : undefined
          }
          onChange={onChange}
        />

        {latitude && longitude && (
          <Marker
            position={[latitude, longitude]}
            draggable
            eventHandlers={{
              dragend(e) {
                const marker = e.target

                const pos = marker.getLatLng()

                onChange(pos.lat, pos.lng)
              },
            }}
            icon={new L.Icon.Default()}
          />
        )}
      </MapContainer>
    </div>
  )
}