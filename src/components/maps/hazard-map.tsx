'use client'

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const marker = new L.Icon({
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface Props {
  latitude?: number | null
  longitude?: number | null
  title?: string
}

export function HazardMap({
  latitude,
  longitude,
  title,
}: Props) {
  if (!latitude || !longitude) return null

  return (
    <div className="overflow-hidden rounded-xl border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        scrollWheelZoom={false}
        dragging={true}
        style={{
          height: 320,
          width: '100%',
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[latitude, longitude]}
          icon={new L.Icon.Default()}
        >
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}