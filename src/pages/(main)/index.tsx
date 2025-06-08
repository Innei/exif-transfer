/* eslint-disable unicorn/prefer-node-protocol */
import { Buffer } from 'buffer'
import type { Exif } from 'exif-reader'
import exifReader from 'exif-reader'
import * as piexif from 'piexif-ts'
import type { DragEvent } from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { ExifDisplay } from '~/components/common/ExifDisplay'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'

interface ImageState {
  file: File | null
  previewUrl: string | null
}

const ImageUploader = ({
  title,
  id,
  image,
  onImageChange,
}: {
  title: string
  id: string
  image: ImageState | null
  onImageChange: (file: File) => void
}) => {
  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) {
        onImageChange(files[0])
      }
    },
    [onImageChange],
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      handleFileChange(event.dataTransfer.files)
    },
    [handleFileChange],
  )

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() =>
        (document.querySelector(`#${id}-file-input`) as HTMLElement)?.click()
      }
    >
      <input
        type="file"
        id={`${id}-file-input`}
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={(e) => handleFileChange(e.target.files)}
      />
      {image?.previewUrl ? (
        <img
          src={image.previewUrl}
          alt={title}
          className="object-contain w-full h-full rounded-lg"
        />
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">{title}</p>
      )}
    </div>
  )
}

export const Component = () => {
  const [sourceImage, setSourceImage] = useState<ImageState | null>(null)
  const [targetImage, setTargetImage] = useState<ImageState | null>(null)
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)
  const [sourceExif, setSourceExif] = useState<Exif | null>(null)
  const [targetExif, setTargetExif] = useState<Exif | null>(null)

  const handleSourceImageChange = (file: File) => {
    setSourceImage({ file, previewUrl: URL.createObjectURL(file) })
    setTargetExif(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dataUrl = e.target?.result as string
        const exifObj = piexif.load(dataUrl)
        const exifSegmentStr = piexif.dump(exifObj)

        const exif = exifReader(Buffer.from(exifSegmentStr, 'binary'))
        setSourceExif(exif)
      } catch (error) {
        console.error('Could not read EXIF data from source image.', error)
        toast.error('Could not read EXIF data from source image.')
        setSourceExif(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleTargetImageChange = (file: File) => {
    setTargetImage({ file, previewUrl: URL.createObjectURL(file) })
    setTargetExif(null)
    setNewImageUrl(null)
  }

  const handleTransfer = async () => {
    if (!sourceImage?.file || !targetImage?.file) {
      toast.error('Please select both source and target images.')
      return
    }

    const readerSource = new FileReader()
    readerSource.onload = (e) => {
      const sourceDataUrl = e.target?.result as string
      const exifObj = piexif.load(sourceDataUrl)
      const exifStr = piexif.dump(exifObj)

      const readerTarget = new FileReader()
      readerTarget.onload = (e) => {
        const targetDataUrl = e.target?.result as string
        const newImageDataUrl = piexif.insert(exifStr, targetDataUrl)
        setNewImageUrl(newImageDataUrl)

        try {
          const newExifObj = piexif.load(newImageDataUrl)
          const newExifSegmentStr = piexif.dump(newExifObj)

          const newExif = exifReader(Buffer.from(newExifSegmentStr, 'binary'))
          setTargetExif(newExif)
        } catch (error) {
          console.error('Could not read EXIF from new image.', error)
          setTargetExif(null)
        }

        // Also update the target image preview to show the new image with exif
        setTargetImage((prev) =>
          prev ? { ...prev, previewUrl: newImageDataUrl } : null,
        )

        toast.success('EXIF data transferred successfully!', {
          description: 'You can now download the image.',
        })
      }
      readerTarget.readAsDataURL(targetImage.file!)
    }
    readerSource.readAsDataURL(sourceImage.file)
  }

  const handleDownload = () => {
    if (!newImageUrl) {
      toast.error('No new image to download.', {
        description: 'Please transfer EXIF data first.',
      })
      return
    }
    const link = document.createElement('a')
    link.href = newImageUrl
    link.download = `processed-${targetImage?.file?.name || 'image.jpg'}`
    document.body.append(link)
    link.click()
    link.remove()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Toaster />
      <div className="w-full max-w-4xl p-8 mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            EXIF Transfer
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Copy EXIF data from one image to another.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ImageUploader
            title="Source Image"
            id="source-image"
            image={sourceImage}
            onImageChange={handleSourceImageChange}
          />

          <ImageUploader
            title="Target Image"
            id="target-image"
            image={targetImage}
            onImageChange={handleTargetImageChange}
          />
        </div>
        <div className="flex justify-center space-x-4">
          <Button onClick={handleTransfer}>Transfer EXIF</Button>
          <Button
            onClick={handleDownload}
            variant="secondary"
            disabled={!newImageUrl}
          >
            Download Image
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ExifDisplay exifData={sourceExif} />
          <ExifDisplay exifData={targetExif} />
        </div>
      </div>
    </div>
  )
}
