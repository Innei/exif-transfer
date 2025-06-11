import { Label } from '@radix-ui/react-label'
/* eslint-disable unicorn/prefer-node-protocol */
import { Buffer } from 'buffer'
import type { Exif } from 'exif-reader'
import exifReader from 'exif-reader'
import * as piexif from 'piexif-ts'
import { useEffect, useRef, useState } from 'react'

import { ExifDisplay } from '~/components/common/ExifDisplay'
import type { ImageState } from '~/components/common/ImageUploader'
import { ImageUploader } from '~/components/common/ImageUploader'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { useExif } from '~/hooks/useExif'
import { convertExifReaderToPiexif } from '~/lib/exif-converter'

export const Component = () => {
  const [image, setImage] = useState<ImageState | null>(null)
  const { exif, piexifExif, fujiRecipe } = useExif(image?.file || null)
  const [editableExif, setEditableExif] = useState<Exif | null>(null)
  const [originalPiexifExif, setOriginalPiexifExif] =
    useState<piexif.IExif | null>(null)
  const [removeGps, setRemoveGps] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (exif) {
      setEditableExif(exif)
    }
    if (piexifExif) {
      setOriginalPiexifExif(piexifExif)
    }
  }, [exif, piexifExif])

  const handleImageChange = (file: File) => {
    setImage({ file, previewUrl: URL.createObjectURL(file) })
  }

  const handleDownload = () => {
    if (!image || !image.file || !editableExif) return
    const { file } = image
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const exifObj = convertExifReaderToPiexif(
        editableExif,
        originalPiexifExif?.thumbnail,
      )

      if (removeGps) {
        exifObj.GPS = {}
      }
      const exifStr = piexif.dump(exifObj)
      const newDataUrl = piexif.insert(exifStr, dataUrl)
      const link = document.createElement('a')
      link.href = newDataUrl
      link.download = file.name
      document.body.append(link)
      link.click()
      link.remove()
    }
    reader.readAsDataURL(file)
  }

  const handleExifChange = (newExif: Exif) => {
    setEditableExif(newExif)
  }

  const handleExportJson = () => {
    if (!editableExif) return

    const jsonData = JSON.stringify(editableExif, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `exif-data-${Date.now()}.json`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = () => {
    fileInputRef.current?.click()
  }

  const handleImportJSONSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/json') {
      alert('Please select a valid JSON file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string
        const rawJsonData = JSON.parse(jsonContent)

        // Restore Buffer objects from serialized JSON
        const parsedExif = restoreBuffersFromJson(rawJsonData) as Exif

        // Convert the JSON EXIF data to piexif format first
        const piexifObj = convertExifReaderToPiexif(
          parsedExif,
          originalPiexifExif?.thumbnail,
        )

        // Then convert back to exif-reader format for consistency
        const exifSegmentStr = piexif.dump(piexifObj)
        const normalizedExif = exifReader(Buffer.from(exifSegmentStr, 'binary'))

        setEditableExif(normalizedExif)
      } catch (error) {
        alert(
          'Failed to parse JSON file. Please ensure it contains valid EXIF data.',
        )
        console.error('JSON parse error:', error)
      }
    }
    // eslint-disable-next-line unicorn/prefer-blob-reading-methods
    reader.readAsText(file)

    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-14rem)] bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-4xl p-8 mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            EXIF Editor
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select an image to view and edit its EXIF data.
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <ImageUploader
            title="Select Image"
            id="reader-image"
            image={image}
            onImageChange={handleImageChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-gps"
              checked={removeGps}
              onCheckedChange={(checked) => setRemoveGps(Boolean(checked))}
            />
            <Label htmlFor="remove-gps">Remove GPS data</Label>
          </div>
          <div>
            <Button onClick={handleDownload} disabled={!image}>
              Export Image
            </Button>
          </div>
          <div className="flex gap-4 mt-2">
            <Button
              onClick={handleImportJson}
              disabled={!image}
              variant="secondary"
            >
              Import EXIF JSON and Overwrite
            </Button>
            <Button
              onClick={handleExportJson}
              disabled={!editableExif}
              variant="secondary"
            >
              Export EXIF JSON
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJSONSelect}
            style={{ display: 'none' }}
          />
        </div>
        <ExifDisplay
          exifData={editableExif}
          fujiRecipe={fujiRecipe}
          onExifChange={handleExifChange}
        />
      </div>
    </div>
  )
}

// Function to restore Buffer objects from JSON
const restoreBuffersFromJson = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Check if this is a serialized Buffer
  if (
    obj.type === 'Buffer' &&
    Array.isArray(obj.data) &&
    obj.data.every((item: any) => typeof item === 'number')
  ) {
    return Buffer.from(obj.data)
  }

  // Check if this is a Uint8Array that was serialized
  if (obj.type === 'Uint8Array' && Array.isArray(obj.data)) {
    return new Uint8Array(obj.data)
  }

  // Recursively process arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => restoreBuffersFromJson(item))
  }

  // Recursively process object properties
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    // Check if this is a date string that should be converted back to Date
    if (
      typeof value === 'string' &&
      (key === 'DateTimeOriginal' ||
        key === 'DateTimeDigitized' ||
        key === 'DateTime' ||
        key.includes('Date') ||
        key.includes('Time')) &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/.test(value)
    ) {
      result[key] = new Date(value)
    } else {
      result[key] = restoreBuffersFromJson(value)
    }
  }
  return result
}
