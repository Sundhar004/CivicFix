'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const customIcons = {
  open: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  claimed: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  fixed: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

interface Issue {
  id: string
  title: string
  description: string
  lat: number
  lng: number
  status: 'open' | 'claimed' | 'fixed'
}

interface MapProps {
  issues?: Issue[]
  selectable?: boolean
  selectedPos?: [number, number] | null
  onLocationSelect?: (lat: number, lng: number) => void
}

function LocationSelector({ onLocationSelect, selectedPos }: { onLocationSelect: (lat: number, lng: number) => void, selectedPos: [number, number] | null }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  
  return selectedPos ? <Marker position={selectedPos} /> : null
}

export default function Map({ issues = [], selectable = false, selectedPos = null, onLocationSelect }: MapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
  }

  const center: [number, number] = issues.length > 0 
    ? [issues[0].lat, issues[0].lng]
    : [40.7128, -74.0060] // NY default

  return (
    <div className="w-full h-[500px] relative rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {issues.map((issue) => (
          <Marker 
            key={issue.id} 
            position={[issue.lat, issue.lng]} 
            icon={customIcons[issue.status as keyof typeof customIcons] || customIcons.open}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-lg mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-2 truncate max-w-[200px]">{issue.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded-full font-semibold ${
                    issue.status === 'open' ? 'bg-red-100 text-red-800' :
                    issue.status === 'claimed' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.status.toUpperCase()}
                  </span>
                  <a href={`/issue/${issue.id}`} className="text-blue-600 hover:underline">View Details →</a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectable && onLocationSelect && (
          <LocationSelector onLocationSelect={onLocationSelect} selectedPos={selectedPos} />
        )}
      </MapContainer>
    </div>
  )
}
