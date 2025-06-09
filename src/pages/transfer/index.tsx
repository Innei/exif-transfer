/* eslint-disable unicorn/prefer-node-protocol */
import { Buffer } from 'buffer'
import exifReader from 'exif-reader'
import getRecipe from 'fuji-recipes'
import * as piexif from 'piexif-ts'
import { useState } from 'react'
import { toast } from 'sonner'

import { ExifDisplay } from '~/components/common/ExifDisplay'
import type { ImageState } from '~/components/common/ImageUploader'
import { ImageUploader } from '~/components/common/ImageUploader'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { useExif } from '~/hooks/useExif'
import { convertExifReaderToPiexif } from '~/lib/exif-converter'

export const Component = () => {
  const [sourceImage, setSourceImage] = useState<ImageState | null>(null)
  const [targetImage, setTargetImage] = useState<ImageState | null>(null)
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)

  const {
    exif: sourceExif,
    piexifExif: sourcePiexifExif,
    fujiRecipe: sourceFujiRecipe,
  } = useExif(sourceImage?.file || null)

  const [targetExif, setTargetExif] = useState<any | null>(null)
  const [targetFujiRecipe, setTargetFujiRecipe] = useState<Record<
    string,
    any
  > | null>(null)
  const [removeGps, setRemoveGps] = useState(true)

  const handleSourceImageChange = (file: File) => {
    setSourceImage({ file, previewUrl: URL.createObjectURL(file) })
    setTargetExif(null)
    setTargetFujiRecipe(null)
  }

  const handleTargetImageChange = (file: File) => {
    setTargetImage({ file, previewUrl: URL.createObjectURL(file) })
    setTargetExif(null)
    setTargetFujiRecipe(null)
    setNewImageUrl(null)
  }

  const handleTransfer = async () => {
    if (!sourceImage?.file || !targetImage?.file || !sourceExif) {
      toast.error('Please select both source and target images.')
      return
    }

    const exifObj = convertExifReaderToPiexif(
      sourceExif,
      sourcePiexifExif?.thumbnail,
    )

    if (removeGps) {
      exifObj.GPS = {}
    }
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
        if ((newExif as any).MakerNote) {
          try {
            const recipe = getRecipe((newExif as any).MakerNote)
            setTargetFujiRecipe(recipe)
          } catch (error) {
            console.warn(
              'Could not parse Fuji recipe from transferred MakerNote.',
              error,
            )
            setTargetFujiRecipe(null)
          }
        } else {
          setTargetFujiRecipe(null)
        }
      } catch (error) {
        console.error('Could not read EXIF from new image.', error)
        setTargetExif(null)
        setTargetFujiRecipe(null)
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-14rem)] bg-zinc-50 dark:bg-zinc-900">
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
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-gps"
              checked={removeGps}
              onCheckedChange={(checked) => setRemoveGps(checked === true)}
            />
            <label
              htmlFor="remove-gps"
              className="text-sm font-medium leading-none cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remove GPS information
            </label>
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
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <ExifDisplay exifData={sourceExif} fujiRecipe={sourceFujiRecipe} />
          <ExifDisplay exifData={targetExif} fujiRecipe={targetFujiRecipe} />
        </div>
      </div>
    </div>
  )
}
