import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import {
  colorSpaceMap,
  exifTagMap,
  exposureProgramMap,
  flashMap,
  fujiDynamicRangeMap,
  fujiFilmSimulationMap,
  meteringModeMap,
  orientationMap,
  whiteBalanceMap,
} from '~/lib/exif-tags'

import { GpsDisplay } from './GpsDisplay'

const IGNORED_KEYS = new Set(['thumbnail'])

const formatValue = (key: string, value: unknown): string => {
  if (value instanceof Date) {
    return value.toLocaleString()
  }
  if (value instanceof Uint8Array) {
    try {
      const str = new TextDecoder().decode(value)
      // eslint-disable-next-line no-control-regex
      if (/[\x00-\x08\x0E-\x1F]/.test(str)) {
        return `[Binary data: ${value.length} bytes]`
      }
      return str.replace(/\0+$/, '') // remove trailing null chars
    } catch {
      return `[Binary data: ${value.length} bytes]`
    }
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'number')) {
      return value.join(', ')
    }
    return JSON.stringify(value)
  }

  // Apply specific value mappings based on the key
  if (typeof value === 'number') {
    switch (key) {
      case 'ExposureProgram': {
        return exposureProgramMap[value] || `Unknown (${value})`
      }
      case 'MeteringMode': {
        return meteringModeMap[value] || `Unknown (${value})`
      }
      case 'Flash': {
        return flashMap[value] || `Unknown (${value})`
      }
      case 'WhiteBalance': {
        return whiteBalanceMap[value] || `Unknown (${value})`
      }
      case 'ColorSpace': {
        return colorSpaceMap[value] || `Unknown (${value})`
      }
      case 'Orientation': {
        return orientationMap[value] || `Unknown (${value})`
      }
    }
  }

  // Format exposure time
  if (key === 'ExposureTime' && typeof value === 'number') {
    if (value < 1) {
      return `1/${Math.round(1 / value)}s`
    }
    return `${value}s`
  }

  // Format F-number
  if (key === 'FNumber' && typeof value === 'number') {
    return `f/${value}`
  }

  // Format focal length
  if (key === 'FocalLength' && typeof value === 'number') {
    return `${value}mm`
  }

  // Format ISO
  if (
    (key === 'ISOSpeedRatings' ||
      key === 'ISO' ||
      key === 'PhotographicSensitivity') &&
    typeof value === 'number'
  ) {
    return `ISO ${value}`
  }

  // Format exposure bias
  if (key === 'ExposureBiasValue' && typeof value === 'number') {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)} EV`
  }

  // Format resolution
  if (
    (key === 'XResolution' || key === 'YResolution') &&
    typeof value === 'number'
  ) {
    return `${value} dpi`
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }

  return String(value)
}

// Format Fuji Recipe values for better readability
const formatFujiRecipeValue = (key: string, value: unknown): string => {
  if (typeof value === 'string') {
    // Film simulation mapping
    if (
      key.toLowerCase().includes('film') ||
      key.toLowerCase().includes('simulation')
    ) {
      return fujiFilmSimulationMap[value] || value
    }
    // Dynamic range mapping
    if (
      key.toLowerCase().includes('dynamic') ||
      key.toLowerCase().includes('range')
    ) {
      return fujiDynamicRangeMap[value] || value
    }
  }

  if (typeof value === 'number') {
    // Format specific numeric values
    if (key.toLowerCase().includes('temperature') && value > 1000) {
      return `${value}K`
    }
    if (
      key.toLowerCase().includes('tint') ||
      key.toLowerCase().includes('fine')
    ) {
      const sign = value >= 0 ? '+' : ''
      return `${sign}${value}`
    }
  }

  return formatValue(key, value)
}

// Extract key photography parameters for the top section
const extractKeyParameters = (
  exifData: Record<string, any>,
): Record<string, any> => {
  const keyParams: Record<string, any> = {}

  // Helper function to find value in nested objects
  const findValue = (keys: string[]): any => {
    for (const key of keys) {
      if (exifData[key] !== undefined && exifData[key] !== null) {
        return exifData[key]
      }
      // Also check in nested objects
      for (const [, sectionValue] of Object.entries(exifData)) {
        if (
          typeof sectionValue === 'object' &&
          sectionValue !== null &&
          !Array.isArray(sectionValue) &&
          sectionValue[key] !== undefined &&
          sectionValue[key] !== null
        ) {
          return sectionValue[key]
        }
      }
    }
    return null
  }

  // Aperture (F-Number) - use FNumber key to trigger proper formatting
  const fNumber = findValue(['FNumber', 'ApertureValue'])
  if (fNumber) keyParams['FNumber'] = fNumber

  // ISO - use ISO key to trigger proper formatting
  const iso = findValue(['ISOSpeedRatings', 'ISO', 'PhotographicSensitivity'])
  if (iso) keyParams['ISO'] = iso

  // Shutter Speed - use ExposureTime key to trigger proper formatting
  const exposureTime = findValue(['ExposureTime'])
  if (exposureTime) keyParams['ExposureTime'] = exposureTime

  // Exposure Compensation - use ExposureBiasValue key to trigger proper formatting
  const exposureBias = findValue(['ExposureBiasValue'])
  if (exposureBias) keyParams['ExposureBiasValue'] = exposureBias

  // Focal Length - use FocalLength key to trigger proper formatting
  const focalLength = findValue(['FocalLength'])
  if (focalLength) keyParams['FocalLength'] = focalLength

  // Camera Model
  const model = findValue(['Model'])
  if (model) keyParams['Camera'] = model

  // Lens Model
  const lensModel = findValue(['LensModel', 'LensInfo'])
  if (lensModel) keyParams['Lens'] = lensModel

  // Date/Time
  const dateTime = findValue(['DateTimeOriginal', 'DateTime'])
  if (dateTime) keyParams['Date Taken'] = dateTime

  return keyParams
}

export const ExifDisplay = ({
  exifData,
  fujiRecipe,
}: {
  exifData: Record<string, any> | null
  fujiRecipe?: Record<string, any> | null
}) => {
  if (!exifData) return null

  const exifSectionsData: [string, Record<string, any>][] = []
  const generalData: [string, any][] = []
  let gpsData: Record<string, any> | null = null

  for (const [key, value] of Object.entries(exifData)) {
    if (IGNORED_KEYS.has(key)) {
      continue
    }

    // Separate GPS data for special handling
    if (key === 'GPSInfo' && typeof value === 'object' && value !== null) {
      gpsData = value
      continue
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Uint8Array) &&
      Object.keys(value).length > 0
    ) {
      exifSectionsData.push([key, value])
    } else if (value !== null && value !== undefined) {
      generalData.push([key, value])
    }
  }

  const allSections = [...exifSectionsData]

  // Add key parameters section at the top
  const keyParams = extractKeyParameters(exifData)
  if (Object.keys(keyParams).length > 0) {
    allSections.unshift(['Key Parameters', keyParams])
  }

  if (fujiRecipe) {
    allSections.unshift(['Fuji Recipe', fujiRecipe])
  }

  if (generalData.length > 0) {
    const generalSection: [string, Record<string, any>] = [
      'General',
      Object.fromEntries(generalData),
    ]
    allSections.unshift(generalSection)
  }

  if (allSections.length === 0 && !gpsData) {
    return (
      <div className="p-4 mt-4 border rounded-lg bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No EXIF data found in this image.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full mt-4">
      {/* Regular EXIF sections */}
      {allSections.length > 0 && (
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={allSections.map(([sectionName]) => sectionName)}
        >
          {allSections.map(([sectionName, sectionData]) => (
            <AccordionItem key={sectionName} value={sectionName}>
              <AccordionTrigger className="text-left">
                <span className="font-medium">
                  {exifTagMap[sectionName] || sectionName}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 text-sm">
                  {Object.entries(sectionData).map(([key, value]) => {
                    const displayKey = exifTagMap[key] || key
                    const displayValue =
                      sectionName === 'Fuji Recipe'
                        ? formatFujiRecipeValue(key, value)
                        : formatValue(key, value)

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[1fr_auto] gap-1 py-1"
                      >
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* GPS Section with specialized component */}
      {gpsData && (
        <div className="mt-4">
          <Accordion type="multiple" className="w-full" defaultValue={['GPS']}>
            <AccordionItem value="GPS">
              <AccordionTrigger className="text-left">
                <span className="font-medium">GPS Location</span>
              </AccordionTrigger>
              <AccordionContent>
                <GpsDisplay gpsData={gpsData} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}
