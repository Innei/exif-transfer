/* eslint-disable unicorn/prefer-node-protocol */
import { Buffer } from 'buffer'
import type { Exif } from 'exif-reader'
import exifReader from 'exif-reader'
import getRecipe from 'fuji-recipes'
import * as piexif from 'piexif-ts'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const useExif = (file: File | null) => {
  const [exif, setExif] = useState<Exif | null>(null)
  const [piexifExif, setPiexifExif] = useState<piexif.IExif | null>(null)
  const [fujiRecipe, setFujiRecipe] = useState<Record<string, any> | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!file) {
      setExif(null)
      setPiexifExif(null)
      setFujiRecipe(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setIsProcessing(true)
      try {
        const dataUrl = e.target?.result as string
        const exifObj = piexif.load(dataUrl)

        setPiexifExif(exifObj)
        const exifSegmentStr = piexif.dump(exifObj)

        const exifData = exifReader(Buffer.from(exifSegmentStr, 'binary'))
        setExif(exifData)

        if (exifData.Photo?.MakerNote) {
          try {
            const recipe = getRecipe(exifData.Photo?.MakerNote)
            setFujiRecipe(recipe)
          } catch (error) {
            console.warn('Could not parse Fuji recipe from MakerNote.', error)
            setFujiRecipe(null)
          }
        } else {
          setFujiRecipe(null)
        }
      } catch (error) {
        console.error('Could not read EXIF data from source image.', error)
        toast.error('Could not read EXIF data from source image.')
        setExif(null)
        setPiexifExif(null)
        setFujiRecipe(null)
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }, [file])

  return { exif, piexifExif, fujiRecipe, isProcessing }
}
