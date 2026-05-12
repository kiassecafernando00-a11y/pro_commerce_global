"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet Default Icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationMapProps {
    onLocationSelect?: (lat: number, lng: number) => void
    initialLat?: number
    initialLng?: number
    readOnly?: boolean
}

function LocationMarker({ onLocationSelect, initialPosition, readOnly }: { onLocationSelect?: (lat: number, lng: number) => void, initialPosition?: L.LatLngExpression, readOnly?: boolean }) {
    const [position, setPosition] = useState<L.LatLngExpression | null>(initialPosition || null)
    const map = useMap()

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition)
            map.flyTo(initialPosition as L.LatLngTuple, 15)
        }
    }, [initialPosition, map])

    useMapEvents({
        click(e) {
            if (readOnly) return
            setPosition(e.latlng)
            if (onLocationSelect) onLocationSelect(e.latlng.lat, e.latlng.lng)
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

export default function LocationMap({ onLocationSelect, initialLat, initialLng, readOnly = false }: LocationMapProps) {
    // Luanda Coordinates as default center
    const defaultCenter: [number, number] = [-8.839988, 13.289437]
    const initialPosition = (initialLat && initialLng) ? [initialLat, initialLng] as L.LatLngTuple : undefined

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-300 relative z-0">
            <MapContainer
                center={initialPosition || defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={!readOnly}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} readOnly={readOnly} />
            </MapContainer>
        </div>
    )
}
