"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect } from "react"

// Fix Leaflet icon issue in Next.js
const icon = L.icon({
    iconUrl: "/images/marker-icon.png", // We'll need to ensure this asset exists or use a CDN
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})

// Or use default CDN if local assets missing
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})


function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng])
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}


function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMapEvents({})
    useEffect(() => {
        map.flyTo(center, map.getZoom())
    }, [center, map])
    return null
}

export default function CheckoutMap({
    position,
    setPosition,
    center = [-8.839988, 13.289437] // Default Luanda
}: {
    position: [number, number] | null,
    setPosition: (pos: [number, number]) => void,
    center?: [number, number]
}) {
    return (
        <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} />
            <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
    )
}
