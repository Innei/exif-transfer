import type { Exif } from 'exif-reader'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { ExifTagDefinition } from '~/lib/exif-addable-tags'
import { addableExifTags } from '~/lib/exif-addable-tags'

interface AddFieldFormProps {
  sectionName: string
  exifData: Exif
  onExifChange: (exifData: Exif) => void
  onCancel: () => void
}

export const AddFieldForm = ({
  sectionName,
  exifData,
  onExifChange,
  onCancel,
}: AddFieldFormProps) => {
  const [newField, setNewField] = useState<{ key: string; value: string }>({
    key: '',
    value: '',
  })

  const handleNewFieldChange = (field: 'key' | 'value', val: string) => {
    setNewField((prev) => ({ ...prev, [field]: val }))
  }

  const handleSaveNewField = () => {
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
    onCancel()
  }

  const sectionTags = addableExifTags[sectionName] || {}

  return (
    <div className="space-y-2">
      <Select
        value={newField.key}
        onValueChange={(val) => handleNewFieldChange('key', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a tag to add" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(sectionTags).map(([tagKey, tagInfo]) => (
            <SelectItem key={tagKey} value={tagKey}>
              {(tagInfo as ExifTagDefinition).description || tagKey}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {newField.key && (
        <>
          <Input
            type={
              (sectionTags[newField.key] as ExifTagDefinition)?.type || 'text'
            }
            placeholder={`Enter value for ${
              (sectionTags[newField.key] as ExifTagDefinition)?.description ||
              newField.key
            }`}
            value={newField.value}
            onChange={(e) => handleNewFieldChange('value', e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSaveNewField}>Save Field</Button>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
