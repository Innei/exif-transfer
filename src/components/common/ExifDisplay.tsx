import type { Exif } from 'exif-reader'
import { useEffect, useRef, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { ExifTagDefinition } from '~/lib/exif-addable-tags'
import { addableExifTags } from '~/lib/exif-addable-tags'
import {
  colorSpaceMap,
  exifTagMap,
  exposureProgramMap,
  flashMap,
  fujiDynamicRangeMap,
  fujiFilmSimulationMap,
  fujiRecipeKeyMap,
  meteringModeMap,
  orientationMap,
  whiteBalanceMap,
} from '~/lib/exif-tags'

import { Input } from '../ui/input'
import type { GpsDisplayProps } from './GpsDisplay'
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

export const unformatValue = (
  key: string,
  value: string,
  originalValue: any,
) => {
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
      return 1 / Number(value.slice(2, -1))
    }
    return Number(value.slice(0, -1))
  }
  if (key === 'FNumber') {
    return Number(value.slice(2))
  }
  if (key === 'FocalLength') {
    return Number(value.slice(0, -2))
  }
  if (key.startsWith('ISO')) {
    return Number(value.slice(4))
  }
  if (key === 'ExposureBiasValue') {
    return Number(value.split(' ')[0])
  }
  if (key.endsWith('Resolution')) {
    return Number(value.split(' ')[0])
  }

  if (originalValue instanceof Date) {
    return new Date(value)
  }

  if (typeof originalValue === 'number') {
    return Number(value)
  }

  return value
}

export const ExifDisplay = ({
  exifData,
  fujiRecipe,
  onExifChange,
}: {
  exifData: Exif | null
  fujiRecipe?: Record<string, any> | null
  onExifChange?: (newExifData: Exif) => void
}) => {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<any>('')
  const [isAddingField, setIsAddingField] = useState(false)
  const [newField, setNewField] = useState<{
    section: string
    key: string
    value: string
  }>({ section: '', key: '', value: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  const disabEditableSection = new Set(['MakerNote', 'thumbnail'])

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingField])

  if (!exifData) {
    return <p>No EXIF data found.</p>
  }

  const keyParameters = extractKeyParameters({
    ...exifData.Image,
    ...exifData.Photo,
  })

  const handleEdit = (sectionName: string, key: string, value: any) => {
    if (!onExifChange || disabEditableSection.has(sectionName)) return
    setEditingField(`${sectionName}.${key}`)

    if (value instanceof Date) {
      // Format date for datetime-local input
      const pad = (num: number) => num.toString().padStart(2, '0')
      const localISOString = `${value.getFullYear()}-${pad(
        value.getMonth() + 1,
      )}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(
        value.getMinutes(),
      )}`
      setEditingValue(localISOString)
    } else {
      setEditingValue(value)
    }
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const handleSave = (sectionName: string, key: string, originalValue: any) => {
    if (!onExifChange) return

    const finalValue = unformatValue(key, editingValue, originalValue)

    const updatedExif = structuredClone(exifData)
    if (updatedExif[sectionName]) {
      updatedExif[sectionName][key] = finalValue
    }

    onExifChange(updatedExif)
    setEditingField(null)
  }

  const handleGpsChange: GpsDisplayProps['onGpsChange'] = (newGpsData) => {
    if (!onExifChange) return
    const updatedExif = {
      ...exifData,
      GPSInfo: newGpsData,
    }
    onExifChange(updatedExif as Exif)
  }

  const handleStartAddField = (sectionName: string) => {
    setNewField({ section: sectionName, key: '', value: '' })
    setIsAddingField(true)
  }

  const handleCancelAddField = () => {
    setIsAddingField(false)
    setNewField({ section: '', key: '', value: '' })
  }

  const handleNewFieldChange = (field: 'key' | 'value', val: string) => {
    setNewField((prev) => ({ ...prev, [field]: val }))
  }

  const handleSaveNewField = (sectionName: string) => {
    if (!onExifChange || !newField.key) return

    const sectionTags = addableExifTags[sectionName]
    if (!sectionTags) return

    const tagDefinition = sectionTags[newField.key]
    if (!tagDefinition) return

    let finalValue: any = newField.value
    if (tagDefinition.type === 'number') {
      finalValue = Number(newField.value)
    } else if (tagDefinition.type === 'datetime-local') {
      finalValue = new Date(newField.value)
    }

    const updatedExif = structuredClone(exifData)
    if (!updatedExif[sectionName]) {
      updatedExif[sectionName] = {}
    }
    updatedExif[sectionName][newField.key] = finalValue
    onExifChange(updatedExif)
    handleCancelAddField()
  }

  const getInputType = (value: any, key: string, sectionName: string) => {
    if (addableExifTags[sectionName] && addableExifTags[sectionName][key]) {
      return addableExifTags[sectionName][key]?.type || 'text'
    }

    if (value instanceof Date) {
      return 'datetime-local'
    }
    if (typeof value === 'number') {
      const formatted = formatValue(key, value)
      if (formatted === String(value)) {
        return 'number'
      }
    }
    return 'text'
  }

  return (
    <div className="w-full">
      {Object.keys(keyParameters).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Key Parameters</h2>
          <div className="grid grid-cols-2 @[30rem]:grid-cols-3 @[40rem]:grid-cols-4 gap-4">
            {Object.entries(keyParameters).map(([key, value]) => (
              <div
                key={key}
                className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md"
              >
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {key}
                </p>
                <p className="text-md font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatValue(key, value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="columns-1 @[40rem]:columns-2 gap-x-8">
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={['FujiRecipe']}
        >
          {fujiRecipe && Object.keys(fujiRecipe).length > 0 && (
            <AccordionItem value="FujiRecipe">
              <AccordionTrigger>Fuji Recipe</AccordionTrigger>
              <AccordionContent>
                <div>
                  {Object.entries(fujiRecipe).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center h-8"
                    >
                      <span className="font-semibold">
                        {fujiRecipeKeyMap[key] || key}
                      </span>
                      <span>{formatFujiRecipeValue(key, value)}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        <Accordion type="multiple" className="w-full" defaultValue={['GPS']}>
          {exifData.GPSInfo && (
            <AccordionItem value="GPS">
              <AccordionTrigger>GPS</AccordionTrigger>
              <AccordionContent>
                <GpsDisplay
                  gpsData={exifData.GPSInfo as Record<string, any>}
                  onGpsChange={onExifChange ? handleGpsChange : undefined}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        <Accordion
          type="multiple"
          className="w-full space-y-4"
          defaultValue={['Exif', 'Photo', 'Image', 'Iop', 'MakerNote']}
        >
          {Object.entries(exifData)
            .filter(
              ([key]) =>
                !IGNORED_KEYS.has(key) &&
                key !== 'GPSInfo' &&
                key !== 'FujiRecipe' &&
                key !== 'bigEndian',
            )
            .map(([sectionName, sectionValue]) => {
              if (
                !sectionValue ||
                (typeof sectionValue === 'object' &&
                  Object.keys(sectionValue).length === 0)
              ) {
                return null
              }

              const sectionTags = addableExifTags[sectionName] || {}

              return (
                <AccordionItem key={sectionName} value={sectionName}>
                  <AccordionTrigger>{sectionName}</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {Object.entries(sectionValue).map(([key, value]) => {
                        const displayKey = exifTagMap[key] || key
                        const formattedValue = formatValue(key, value)
                        const fieldId = `${sectionName}.${key}`
                        const isEditing = editingField === fieldId
                        const isEditable =
                          !!onExifChange &&
                          !disabEditableSection.has(sectionName) &&
                          !formattedValue.startsWith('[Binary data:')

                        return (
                          <div
                            key={key}
                            className="flex justify-between items-center group"
                          >
                            <span className="font-semibold break-all">
                              {displayKey}
                            </span>
                            <div className="text-right">
                              {isEditing ? (
                                <div className="h-8 relative flex w-48 items-center">
                                  <Input
                                    ref={inputRef}
                                    type={getInputType(value, key, sectionName)}
                                    value={editingValue}
                                    onChange={(e) =>
                                      setEditingValue(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSave(sectionName, key, value)
                                      }
                                      if (e.key === 'Escape') {
                                        handleCancel()
                                      }
                                    }}
                                    inputClassName="pr-24"
                                    className="w-full text-right"
                                  />
                                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
                                    <button
                                      type="button"
                                      className="h-6 px-2 text-xs"
                                      onClick={() =>
                                        handleSave(sectionName, key, value)
                                      }
                                    >
                                      <i className="i-mingcute-check-line" />
                                    </button>
                                    <button
                                      type="button"
                                      className="h-6 px-2 text-xs"
                                      onClick={handleCancel}
                                    >
                                      <i className="i-mingcute-close-line" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className={`flex min-h-8 items-center justify-end rounded p-1 break-all ${
                                    isEditable
                                      ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    isEditable &&
                                    handleEdit(sectionName, key, value)
                                  }
                                >
                                  {formattedValue}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {!!onExifChange &&
                        !disabEditableSection.has(sectionName) &&
                        Object.keys(sectionTags).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            {isAddingField &&
                            newField.section === sectionName ? (
                              <div className="space-y-2">
                                <Select
                                  value={newField.key}
                                  onValueChange={(val) =>
                                    handleNewFieldChange('key', val)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a tag to add" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(sectionTags).map(
                                      ([tagKey, tagInfo]) => (
                                        <SelectItem key={tagKey} value={tagKey}>
                                          {(tagInfo as ExifTagDefinition)
                                            .description || tagKey}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>

                                {newField.key && (
                                  <>
                                    <Input
                                      type={
                                        (
                                          sectionTags[
                                            newField.key
                                          ] as ExifTagDefinition
                                        )?.type || 'text'
                                      }
                                      placeholder={`Enter value for ${
                                        (
                                          sectionTags[
                                            newField.key
                                          ] as ExifTagDefinition
                                        )?.description || newField.key
                                      }`}
                                      value={newField.value}
                                      onChange={(e) =>
                                        handleNewFieldChange(
                                          'value',
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <div className="flex gap-2 pt-2">
                                      <Button
                                        onClick={() =>
                                          handleSaveNewField(sectionName)
                                        }
                                      >
                                        Save Field
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        onClick={handleCancelAddField}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="light"
                                className="gap-1"
                                onClick={() => handleStartAddField(sectionName)}
                              >
                                <i className="i-mingcute-add-line" /> Add Field
                              </Button>
                            )}
                          </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
        </Accordion>
      </div>
    </div>
  )
}
