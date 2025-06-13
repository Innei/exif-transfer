import type { Exif } from 'exif-reader'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Input } from '~/components/ui/input'
import type { ExifTagDefinition } from '~/lib/exif-addable-tags'
import { addableExifTags } from '~/lib/exif-addable-tags'
import { formatValue, unformatValue } from '~/lib/exif-format'
import { exifTagMap } from '~/lib/exif-tags'

import { BinaryDataViewer } from './BinaryDataViewer'

interface ExifFieldProps {
  sectionName: string
  fieldKey: string
  value: any
  onExifChange: (exifData: Exif) => void
  exifData: Exif
}

const disabEditableSection = new Set(['MakerNote', 'thumbnail'])

export const ExifField = ({
  sectionName,
  fieldKey,
  value,
  onExifChange,
  exifData,
}: ExifFieldProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingValue, setEditingValue] = useState<any>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const displayKey = exifTagMap[fieldKey] || fieldKey
  const formattedValue = formatValue(fieldKey, value)

  const isEditable = useMemo(() => {
    if (!onExifChange) return false

    if (disabEditableSection.has(sectionName)) return false
    if (
      typeof formattedValue === 'string' &&
      formattedValue.startsWith('[Binary data:')
    )
      return false

    if (
      typeof formattedValue === 'object' &&
      formattedValue &&
      'type' in formattedValue &&
      formattedValue.type === BinaryDataViewer
    )
      return false

    return true
  }, [onExifChange, sectionName, formattedValue])

  const handleEdit = () => {
    if (!isEditable) return
    setIsEditing(true)
    if (value instanceof Date) {
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
    setIsEditing(false)
    setEditingValue('')
  }

  const handleSave = () => {
    if (!onExifChange) return

    const finalValue = unformatValue(fieldKey, editingValue, value)

    const updatedExif = structuredClone(exifData)
    if (updatedExif[sectionName]) {
      updatedExif[sectionName][fieldKey] = finalValue
    }

    onExifChange(updatedExif)
    setIsEditing(false)
  }

  const getInputType = () => {
    if (
      addableExifTags[sectionName] &&
      addableExifTags[sectionName][fieldKey]
    ) {
      return (addableExifTags[sectionName][fieldKey] as ExifTagDefinition).type
    }

    if (value instanceof Date) {
      return 'datetime-local'
    }
    if (typeof value === 'number') {
      const formatted = formatValue(fieldKey, value)
      if (formatted === String(value)) {
        return 'number'
      }
    }
    return 'text'
  }

  return (
    <div className="flex justify-between items-center group">
      <span className="font-semibold break-all">{displayKey}</span>
      <div className="text-right">
        {isEditing ? (
          <div className="h-8 relative flex w-48 items-center">
            <Input
              ref={inputRef}
              type={getInputType()}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              inputClassName="pr-24"
              className="w-full text-right"
            />
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
              <button
                type="button"
                className="h-6 px-2 text-xs"
                onClick={handleSave}
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
            onClick={isEditable ? handleEdit : undefined}
          >
            {formattedValue}
          </span>
        )}
      </div>
    </div>
  )
}
