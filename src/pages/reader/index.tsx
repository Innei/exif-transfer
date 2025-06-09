import * as piexif from 'piexif-ts'
import { useState } from 'react'

import { ExifDisplay } from '~/components/common/ExifDisplay'
import type { ImageState } from '~/components/common/ImageUploader'
import { ImageUploader } from '~/components/common/ImageUploader'
import { Button } from '~/components/ui/button'
import { useExif } from '~/hooks/useExif'

export const Component = () => {
  const [image, setImage] = useState<ImageState | null>(null)
  const { exif, fujiRecipe } = useExif(image?.file || null)

  const handleImageChange = (file: File) => {
    setImage({ file, previewUrl: URL.createObjectURL(file) })
  }

  const handleDownload = () => {
    if (!image || !image.file) return
    const { file } = image
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const exifObj = piexif.load(dataUrl)
      delete exifObj.GPS
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-14rem)] bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-4xl p-8 mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            EXIF Reader
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select an image to view its EXIF data.
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
        <div className="flex justify-center mt-4">
          <Button onClick={handleDownload} disabled={!image}>
            Export Image Without GPS
          </Button>
        </div>
        <ExifDisplay exifData={exif} fujiRecipe={fujiRecipe} />
      </div>
    </div>
  )
}
