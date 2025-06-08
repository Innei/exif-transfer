import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { exifTagMap } from '~/lib/exif-tags'

const IGNORED_KEYS = new Set(['thumbnail'])

const formatValue = (value: unknown): string => {
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
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }

  return String(value)
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

  for (const [key, value] of Object.entries(exifData)) {
    if (IGNORED_KEYS.has(key)) {
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

  if (allSections.length === 0) {
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
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={allSections.map(([sectionName]) => sectionName)}
      >
        {allSections.map(([sectionName, sectionData]) => (
          <AccordionItem value={sectionName} key={sectionName}>
            <AccordionTrigger>
              {exifTagMap[sectionName] ?? sectionName}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                {Object.entries(sectionData as Record<string, any>).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1"
                    >
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                        {exifTagMap[key] ?? key}:
                      </span>
                      <span className="overflow-hidden break-all text-ellipsis text-zinc-800 dark:text-zinc-200">
                        {formatValue(value)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
