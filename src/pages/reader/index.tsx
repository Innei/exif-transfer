import { useState } from 'react'

import { ExifDisplay } from '~/components/common/ExifDisplay'
import type { ImageState } from '~/components/common/ImageUploader'
import { ImageUploader } from '~/components/common/ImageUploader'
import { useExif } from '~/hooks/useExif'

export const Component = () => {
  const [image, setImage] = useState<ImageState | null>(null)
  const { exif, fujiRecipe } = useExif(image?.file || null)

  const handleImageChange = (file: File) => {
    setImage({ file, previewUrl: URL.createObjectURL(file) })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-15rem)] bg-zinc-50 dark:bg-zinc-900">
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

        <ExifDisplay exifData={exif} fujiRecipe={fujiRecipe} />
      </div>
    </div>
  )
}
