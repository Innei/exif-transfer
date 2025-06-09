import { Label } from '@radix-ui/react-label'
import * as piexif from 'piexif-ts'
import { useEffect, useState } from 'react'

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
  const [editableExif, setEditableExif] = useState<Record<string, any> | null>(
    null,
  )
  const [originalPiexifExif, setOriginalPiexifExif] =
    useState<piexif.IExif | null>(null)
  const [removeGps, setRemoveGps] = useState(true)

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

  const handleExifChange = (newExif: Record<string, any>) => {
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
          <div className="flex gap-4">
            <Button onClick={handleDownload} disabled={!image}>
              Export Image
            </Button>
            <Button
              onClick={handleExportJson}
              disabled={!editableExif}
              variant="secondary"
            >
              Export EXIF JSON
            </Button>
          </div>
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
