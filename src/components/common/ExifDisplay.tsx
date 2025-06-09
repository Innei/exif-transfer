import { useEffect, useRef, useState } from 'react'

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

import { Input } from '../ui/input'
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

const reverseMap = (map: Record<number, string>): Record<string, number> => {
  const reversed: Record<string, number> = {}
  for (const [key, value] of Object.entries(map)) {
    reversed[value] = Number(key)
  }
  return reversed
}

const reversedExposureProgramMap = reverseMap(exposureProgramMap)
const reversedMeteringModeMap = reverseMap(meteringModeMap)
const reversedFlashMap = reverseMap(flashMap)
const reversedWhiteBalanceMap = reverseMap(whiteBalanceMap)
const reversedColorSpaceMap = reverseMap(colorSpaceMap)
const reversedOrientationMap = reverseMap(orientationMap)
const reversedFujiFilmSimulationMap = reverseMap(fujiFilmSimulationMap)
const reversedFujiDynamicRangeMap = reverseMap(fujiDynamicRangeMap)

const unformatValue = (key: string, value: string, originalValue: any) => {
  if (reversedExposureProgramMap[value])
    return reversedExposureProgramMap[value]
  if (reversedMeteringModeMap[value]) return reversedMeteringModeMap[value]
  if (reversedFlashMap[value]) return reversedFlashMap[value]
  if (reversedWhiteBalanceMap[value]) return reversedWhiteBalanceMap[value]
  if (reversedColorSpaceMap[value]) return reversedColorSpaceMap[value]
  if (reversedOrientationMap[value]) return reversedOrientationMap[value]
  if (reversedFujiFilmSimulationMap[value])
    return reversedFujiFilmSimulationMap[value]
  if (reversedFujiDynamicRangeMap[value])
    return reversedFujiDynamicRangeMap[value]

  if (key === 'ExposureTime') {
    if (value.startsWith('1/')) {
      return 1 / Number(value.split('/')[1].replace('s', ''))
    }
    return Number(value.replace('s', ''))
  }
  if (key === 'FNumber') {
    return Number(value.replace('f/', ''))
  }
  if (key === 'FocalLength') {
    return Number(value.replace('mm', ''))
  }
  if (
    key === 'ISOSpeedRatings' ||
    key === 'ISO' ||
    key === 'PhotographicSensitivity'
  ) {
    return Number(value.replace('ISO ', ''))
  }
  if (key === 'ExposureBiasValue') {
    return Number(value.replace(' EV', '').replace('+', ''))
  }
  if (key === 'XResolution' || key === 'YResolution') {
    return Number(value.replace(' dpi', ''))
  }

  // fuji recipe
  if (key.toLowerCase().includes('temperature') && value.endsWith('K')) {
    return Number(value.replace('K', ''))
  }
  if (
    key.toLowerCase().includes('tint') ||
    key.toLowerCase().includes('fine')
  ) {
    return Number(value.replace('+', ''))
  }

  if (typeof originalValue === 'number') {
    const parsed = Number.parseFloat(value)
    return Number.isNaN(parsed) ? originalValue : parsed
  }

  if (originalValue instanceof Date) {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? originalValue : new Date(parsed)
  }

  return value
}

const disabEditableSection = new Set(['Fuji Recipe', 'Key Parameters'])

export const ExifDisplay = ({
  exifData,
  fujiRecipe,
  onExifChange,
}: {
  exifData: Record<string, any> | null
  fujiRecipe?: Record<string, any> | null
  onExifChange?: (newExifData: Record<string, any>) => void
}) => {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingField])

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

  const handleEdit = (sectionName: string, key: string, value: any) => {
    if (!onExifChange) return
    const fieldId = `${sectionName}.${key}`
    setEditingField(fieldId)
    if (value instanceof Date) {
      const pad = (num: number) => num.toString().padStart(2, '0')
      const localISOString = `${value.getFullYear()}-${pad(
        value.getMonth() + 1,
      )}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(
        value.getMinutes(),
      )}`
      setEditingValue(localISOString)
    } else {
      const formatted =
        sectionName === 'Fuji Recipe'
          ? formatFujiRecipeValue(key, value)
          : formatValue(key, value)
      setEditingValue(formatted)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const handleSave = (sectionName: string, key: string, originalValue: any) => {
    if (!onExifChange) return
    if (!exifData) return
    const unformattedValue = unformatValue(key, editingValue, originalValue)

    const newExifData = structuredClone(exifData)

    if (sectionName === 'Fuji Recipe' && fujiRecipe) {
      // Fuji Recipe is not meant to be edited directly here as per new logic
    } else if (
      newExifData[sectionName] &&
      typeof newExifData[sectionName] === 'object' &&
      key in newExifData[sectionName]
    ) {
      newExifData[sectionName][key] = unformattedValue
    } else if (key in newExifData) {
      newExifData[key] = unformattedValue
    } else {
      // Fallback for key parameters which might be at the top level
      let found = false
      for (const section in newExifData) {
        if (
          typeof newExifData[section] === 'object' &&
          newExifData[section] !== null &&
          newExifData[section][key] !== undefined
        ) {
          newExifData[section][key] = unformattedValue
          found = true
          break
        }
      }
      if (!found) {
        // if still not found, it might be a key parameter that is not in a section
        // e.g. 'Camera' for 'Model'
        const keyMap: Record<string, string[]> = {
          Camera: ['Model'],
          Lens: ['LensModel', 'LensInfo'],
          'Date Taken': ['DateTimeOriginal', 'DateTime'],
          FNumber: ['FNumber', 'ApertureValue'],
          ISO: ['ISOSpeedRatings', 'ISO', 'PhotographicSensitivity'],
          ExposureTime: ['ExposureTime'],
          ExposureBiasValue: ['ExposureBiasValue'],
          FocalLength: ['FocalLength'],
        }

        const realKeys = keyMap[key]
        if (realKeys) {
          for (const realKey of realKeys) {
            let updated = false
            // search for the key in all sections and update it
            for (const section in newExifData) {
              if (
                typeof newExifData[section] === 'object' &&
                newExifData[section] !== null &&
                newExifData[section][realKey] !== undefined
              ) {
                newExifData[section][realKey] = unformattedValue
                updated = true
                break
              }
            }
            if (updated) break
          }
        }
      }
    }
    onExifChange(newExifData)
    setEditingField(null)
  }

  const handleGpsChange = (newGpsData: Record<string, any>) => {
    if (!onExifChange || !exifData) return

    const newExifData = structuredClone(exifData)
    newExifData.GPSInfo = {
      ...newExifData.GPSInfo,
      ...newGpsData,
    }
    onExifChange(newExifData)
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
                    const fieldId = `${sectionName}.${key}`
                    const isEditing = editingField === fieldId

                    const isEditable =
                      onExifChange &&
                      !disabEditableSection.has(sectionName) &&
                      !displayValue.startsWith('[Binary data:')

                    const isPlainNumber =
                      typeof value === 'number' &&
                      (sectionName === 'Fuji Recipe'
                        ? formatFujiRecipeValue(key, value)
                        : formatValue(key, value)) === String(value)

                    const getInputType = () => {
                      if (value instanceof Date) {
                        return 'datetime-local'
                      }
                      if (isPlainNumber) {
                        return 'number'
                      }
                      return 'text'
                    }

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[1fr_auto] gap-1 py-1 group"
                      >
                        <div className="font-medium text-text break-words">
                          {displayKey}
                        </div>
                        <div className="text-text-secondary break-words font-mono text-xs sm:text-sm">
                          {isEditing ? (
                            <Input
                              ref={inputRef}
                              type={getInputType()}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSave(sectionName, key, value)
                                }
                                if (e.key === 'Escape') {
                                  handleCancel()
                                }
                              }}
                              onBlur={handleCancel}
                              className="h-6 px-1 w-full"
                            />
                          ) : (
                            <div
                              className={`rounded border border-transparent h-6 ${isEditable ? 'group-hover:border-zinc-300 dark:group-hover:border-zinc-700 cursor-pointer' : 'cursor-not-allowed'}`}
                              onClick={() => {
                                if (isEditable) {
                                  handleEdit(sectionName, key, value)
                                }
                              }}
                            >
                              <span className="px-1">{displayValue}</span>
                            </div>
                          )}
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
                <GpsDisplay
                  gpsData={gpsData}
                  onGpsChange={onExifChange ? handleGpsChange : undefined}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}
