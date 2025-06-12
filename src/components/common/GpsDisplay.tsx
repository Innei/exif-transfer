import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { useState } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import { exifTagMap } from '~/lib/exif-tags'

import { Button } from '../ui/button'

// You might need to import the marker icons if they are not showing up
// @ts-expect-error no types
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface GpsData {
  GPSLatitude?: number[]
  GPSLongitude?: number[]
  GPSLatitudeRef?: string
  GPSLongitudeRef?: string
  GPSAltitude?: number
  GPSAltitudeRef?: number
  GPSDateStamp?: string
  GPSTimeStamp?: number[]
  [key: string]: any
}

export interface GpsDisplayProps {
  gpsData: GpsData
  onGpsChange?: (newGpsData: Partial<GpsData>) => void
}

// Convert GPS coordinates from EXIF format to decimal degrees
const convertGpsCoordinate = (
  coordinate: number[],
  ref: string,
): number | null => {
  if (!coordinate || coordinate.length < 3) return null

  const degrees = coordinate[0]
  const minutes = coordinate[1]
  const seconds = coordinate[2]

  let decimal = degrees + minutes / 60 + seconds / 3600

  // Apply reference direction (S and W are negative)
  if (ref === 'S' || ref === 'W') {
    decimal = -decimal
  }

  return decimal
}

// Convert decimal degrees to EXIF GPS format
const convertDecimalToGps = (
  decimal: number,
  type: 'lat' | 'lng',
): { coordinate: number[]; ref: string } => {
  const ref =
    type === 'lat' ? (decimal >= 0 ? 'N' : 'S') : decimal >= 0 ? 'E' : 'W'
  const absDecimal = Math.abs(decimal)

  const degrees = Math.floor(absDecimal)
  const minutes = Math.floor((absDecimal - degrees) * 60)
  const seconds = ((absDecimal - degrees) * 60 - minutes) * 3600

  return { coordinate: [degrees, minutes, seconds], ref }
}

// Format GPS time from array to readable string
const formatGpsTime = (timeArray: number[]): string => {
  if (!timeArray || timeArray.length < 3) return ''

  const hours = Math.floor(timeArray[0]).toString().padStart(2, '0')
  const minutes = Math.floor(timeArray[1]).toString().padStart(2, '0')
  const seconds = Math.floor(timeArray[2]).toString().padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}

// Format GPS coordinate for display
const formatGpsCoordinate = (
  coordinate: number[],
  ref: string,
  type: 'lat' | 'lng',
): string => {
  if (!coordinate || coordinate.length < 3) return 'N/A'

  const degrees = Math.floor(coordinate[0])
  const minutes = Math.floor(coordinate[1])
  const seconds = coordinate[2].toFixed(2)

  const direction =
    type === 'lat' ? (ref === 'N' ? 'N' : 'S') : ref === 'E' ? 'E' : 'W'

  return `${degrees}°${minutes}'${seconds}"${direction}`
}

const LocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
}: {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
}) => {
  const [markerPosition, setMarkerPosition] = useState<L.LatLng>(
    new L.LatLng(latitude, longitude),
  )

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng)
        onLocationChange(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }

  const RecenterAutomatically = ({
    lat,
    lng,
  }: {
    lat: number
    lng: number
  }) => {
    const map = useMap()
    useState(() => {
      map.setView([lat, lng])
    })
    return null
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: '300px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={markerPosition} />
      <MapEvents />
      <RecenterAutomatically lat={latitude} lng={longitude} />
    </MapContainer>
  )
}

export const GpsDisplay = ({ gpsData, onGpsChange }: GpsDisplayProps) => {
  const [showMap, setShowMap] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Convert coordinates to decimal degrees
  const latitude =
    gpsData.GPSLatitude && gpsData.GPSLatitudeRef
      ? convertGpsCoordinate(gpsData.GPSLatitude, gpsData.GPSLatitudeRef)
      : null

  const longitude =
    gpsData.GPSLongitude && gpsData.GPSLongitudeRef
      ? convertGpsCoordinate(gpsData.GPSLongitude, gpsData.GPSLongitudeRef)
      : null

  // If no valid coordinates, don't show the component
  if (!latitude || !longitude) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        No valid GPS coordinates found
      </div>
    )
  }

  const handleLocationChange = (lat: number, lng: number) => {
    if (!onGpsChange) return

    const { coordinate: latCoord, ref: latRef } = convertDecimalToGps(
      lat,
      'lat',
    )
    const { coordinate: lngCoord, ref: lngRef } = convertDecimalToGps(
      lng,
      'lng',
    )

    onGpsChange({
      GPSLatitude: latCoord,
      GPSLatitudeRef: latRef,
      GPSLongitude: lngCoord,
      GPSLongitudeRef: lngRef,
    })
  }

  // Create map URLs
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`

  // Embedded map URL (using OpenStreetMap)
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`

  return (
    <div className="space-y-4">
      {isEditing ? (
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={handleLocationChange}
        />
      ) : (
        <>
          {/* GPS Information */}
          <div className="grid gap-2 text-sm">
            {/* Coordinates */}
            <div className="grid grid-cols-[1fr_auto] gap-1 py-1">
              <div className="font-medium text-text break-words">
                Coordinates
              </div>
              <div className="text-text-secondary break-words font-mono text-xs sm:text-sm">
                {formatGpsCoordinate(
                  gpsData.GPSLatitude!,
                  gpsData.GPSLatitudeRef!,
                  'lat',
                )}
                ,{' '}
                {formatGpsCoordinate(
                  gpsData.GPSLongitude!,
                  gpsData.GPSLongitudeRef!,
                  'lng',
                )}
              </div>
            </div>

            {/* Decimal Coordinates */}
            <div className="grid grid-cols-[1fr_auto] gap-1 py-1">
              <div className="font-medium text-text break-words">
                Decimal Coordinates
              </div>
              <div className="text-text-secondary break-words font-mono text-xs sm:text-sm">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            </div>

            {/* Altitude */}
            {gpsData.GPSAltitude && (
              <div className="grid grid-cols-[1fr_auto] gap-1 py-1">
                <div className="font-medium text-text break-words">
                  Altitude
                </div>
                <div className="text-text-secondary break-words font-mono text-xs sm:text-sm">
                  {`${gpsData.GPSAltitudeRef === 1 ? '-' : ''}${gpsData.GPSAltitude}m`}
                </div>
              </div>
            )}

            {/* GPS Time */}
            {gpsData.GPSTimeStamp && (
              <div className="grid grid-cols-[1fr_auto] gap-1 py-1">
                <div className="font-medium text-text break-words">
                  GPS Time
                </div>
                <div className="text-text-secondary break-words font-mono text-xs sm:text-sm">
                  {`${gpsData.GPSDateStamp ? `${gpsData.GPSDateStamp} ` : ''}${formatGpsTime(gpsData.GPSTimeStamp)} UTC`}
                </div>
              </div>
            )}

            {/* Other GPS fields */}
            {Object.entries(gpsData).map(([key, value]) => {
              // Skip already displayed fields
              if (
                [
                  'GPSLatitude',
                  'GPSLongitude',
                  'GPSLatitudeRef',
                  'GPSLongitudeRef',
                  'GPSAltitude',
                  'GPSAltitudeRef',
                  'GPSTimeStamp',
                  'GPSDateStamp',
                ].includes(key)
              ) {
                return null
              }

              if (value === null || value === undefined) return null

              const displayKey = exifTagMap[key] || key
              const displayValue = Array.isArray(value)
                ? value.join(', ')
                : String(value)

              return (
                <div key={key} className="grid grid-cols-[1fr_auto] gap-1 py-1">
                  <div className="font-medium text-text break-words">
                    {displayKey}
                  </div>
                  <div className="text-text-secondary break-words font-mono text-xs sm:text-sm">
                    {displayValue}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Map Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap justify-end">
          {onGpsChange && (
            <Button type="button" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Done Editing' : 'Edit Location'}
            </Button>
          )}

          {!isEditing && (
            <>
              <Button type="button" onClick={() => setShowMap(!showMap)}>
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
              <Button
                className="bg-green"
                onClick={() => {
                  window.open(googleMapsUrl, '_blank')
                }}
              >
                Open in Google Maps
              </Button>
              <Button
                className="bg-orange"
                onClick={() => {
                  window.open(openStreetMapUrl, '_blank')
                }}
              >
                Open in OpenStreetMap
              </Button>
            </>
          )}
        </div>

        {/* Embedded Map */}
        {!isEditing && showMap && (
          <div className="mt-2">
            <iframe
              src={embedMapUrl}
              width="100%"
              height="300"
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg"
              title="Location Map"
              loading="lazy"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Map data © OpenStreetMap contributors
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
