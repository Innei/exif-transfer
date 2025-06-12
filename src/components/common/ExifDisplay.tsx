import type { Exif } from 'exif-reader'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { formatFujiRecipeValue } from '~/lib/exif-format'
import { fujiRecipeKeyMap } from '~/lib/exif-tags'

import { ExifSection } from './ExifSection'
import type { GpsDisplayProps } from './GpsDisplay'
import { GpsDisplay } from './GpsDisplay'
import { KeyParameters } from './KeyParameters'

const IGNORED_KEYS = new Set(['thumbnail'])

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
  onExifChange,
}: {
  exifData: Exif | null
  fujiRecipe?: Record<string, any> | null
  onExifChange?: (newExifData: Exif) => void
}) => {
  if (!exifData) {
    return <p>No EXIF data found.</p>
  }

  const keyParameters = extractKeyParameters({
    ...exifData.Image,
    ...exifData.Photo,
  })

  const handleGpsChange: GpsDisplayProps['onGpsChange'] = (newGpsData) => {
    if (!onExifChange) return
    const updatedExif = {
      ...exifData,
      GPSInfo: newGpsData,
    }
    onExifChange(updatedExif as Exif)
  }

  return (
    <div className="w-full">
      <KeyParameters keyParameters={keyParameters} />

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
          {Object.entries(exifData).map(([sectionName, sectionValue]) => {
            if (
              !IGNORED_KEYS.has(sectionName) &&
              sectionName !== 'GPSInfo' &&
              sectionName !== 'FujiRecipe' &&
              typeof sectionValue === 'object' &&
              sectionValue !== null
            ) {
              return (
                <ExifSection
                  key={sectionName}
                  sectionName={sectionName}
                  sectionValue={sectionValue}
                  exifData={exifData}
                  onExifChange={onExifChange}
                />
              )
            }
            return null
          })}
        </Accordion>
      </div>
    </div>
  )
}
