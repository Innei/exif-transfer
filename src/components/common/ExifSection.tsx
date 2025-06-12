import type { Exif } from 'exif-reader'
import { useState } from 'react'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { addableExifTags } from '~/lib/exif-addable-tags'

import { AddFieldForm } from './AddFieldForm'
import { ExifField } from './ExifField'

interface ExifSectionProps {
  sectionName: string
  sectionValue: Record<string, any>
  exifData: Exif
  onExifChange?: (exifData: Exif) => void
}

const disabEditableSection = new Set(['MakerNote', 'thumbnail'])

export const ExifSection = ({
  sectionName,
  sectionValue,
  exifData,
  onExifChange,
}: ExifSectionProps) => {
  const [isAddingField, setIsAddingField] = useState(false)

  if (
    !sectionValue ||
    (typeof sectionValue === 'object' && Object.keys(sectionValue).length === 0)
  ) {
    return null
  }

  const sectionTags = addableExifTags[sectionName] || {}

  return (
    <AccordionItem value={sectionName}>
      <AccordionTrigger>{sectionName}</AccordionTrigger>
      <AccordionContent>
        <div>
          {Object.entries(sectionValue).map(([key, value]) => (
            <ExifField
              key={key}
              sectionName={sectionName}
              fieldKey={key}
              value={value}
              onExifChange={onExifChange!}
              exifData={exifData}
            />
          ))}
          {!!onExifChange &&
            !disabEditableSection.has(sectionName) &&
            Object.keys(sectionTags).length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {isAddingField ? (
                  <AddFieldForm
                    sectionName={sectionName}
                    exifData={exifData}
                    onExifChange={onExifChange}
                    onCancel={() => setIsAddingField(false)}
                  />
                ) : (
                  <Button
                    variant="light"
                    className="gap-1"
                    onClick={() => setIsAddingField(true)}
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
}
