import type { Exif } from 'exif-reader'
import * as piexif from 'piexif-ts'

const RATIONAL_TAGS = new Set([
  'ExposureTime',
  'FNumber',
  'ApertureValue',
  'FocalLength',
  'XResolution',
  'YResolution',
  'ExposureBiasValue',
  'CompressedBitsPerPixel',
  'ShutterSpeedValue',
  'BrightnessValue',
  'MaxApertureValue',
  'SubjectDistance',
  'FocalPlaneXResolution',
  'FocalPlaneYResolution',
  'DigitalZoomRatio',
  'Gamma',
  'ExposureIndex',
  'GPSAltitude',
  'GPSSpeed',
  'GPSImgDirection',
  'GPSDestBearing',
  'GPSDestDistance',
  'GPSHPositioningError',
  'CameraElevationAngle',
])

const RATIONAL_ARRAY_TAGS = new Set([
  'LensSpecification',
  'WhitePoint',
  'PrimaryChromaticities',
  'YCbCrCoefficients',
  'ReferenceBlackWhite',
  'GPSLatitude',
  'GPSLongitude',
  'GPSTimeStamp',
  'GPSDestLatitude',
  'GPSDestLongitude',
])

const UNDEFINED_TAGS = new Set([
  'ExifVersion',
  'FlashpixVersion',
  'ComponentsConfiguration',
  'MakerNote',
  'UserComment',
  'FileSource',
  'SceneType',
  'PrintImageMatching',
])
const DATETIME_TAGS = new Set([
  'DateTimeOriginal',
  'DateTimeDigitized',
  'DateTime',
])

const convertValueToPiexifFormat = (tagName: string, value: any) => {
  if (RATIONAL_TAGS.has(tagName) && typeof value === 'number') {
    const denominator = 100_000
    const numerator = Math.round(value * denominator)
    return [numerator, denominator]
  }

  if (RATIONAL_ARRAY_TAGS.has(tagName) && Array.isArray(value)) {
    return value.map((v) => {
      if (typeof v === 'number') {
        const denominator = 100_000
        const numerator = Math.round(v * denominator)
        return [numerator, denominator]
      }
      // It might already be in the correct format
      return v
    })
  }

  if (
    tagName === 'UserComment' &&
    typeof value === 'object' &&
    value !== null &&
    'comment' in value
  ) {
    // piexif-ts will add ASCII prefix if it's a plain string.
    // This is safer than trying to reconstruct the comment block with encoding.
    return value.comment
  }

  if (UNDEFINED_TAGS.has(tagName)) {
    if (value instanceof Uint8Array) {
      return String.fromCodePoint(...value)
    }
    if (
      typeof value === 'object' &&
      value !== null &&
      value.value &&
      Array.isArray(value.value)
    ) {
      return String.fromCodePoint(...value.value)
    }
    // Handle MakerNote which might be an object with numeric keys from exif-reader
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const byteValues = Object.values(value)
      if (
        byteValues.length > 0 &&
        byteValues.every((v) => typeof v === 'number')
      ) {
        return String.fromCodePoint(...(byteValues as number[]))
      }
    }
  }

  if (DATETIME_TAGS.has(tagName) && value instanceof Date) {
    const year = value.getFullYear()
    const month = (value.getMonth() + 1).toString().padStart(2, '0')
    const day = value.getDate().toString().padStart(2, '0')
    const hours = value.getHours().toString().padStart(2, '0')
    const minutes = value.getMinutes().toString().padStart(2, '0')
    const seconds = value.getSeconds().toString().padStart(2, '0')
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`
  }

  return value
}

export const convertExifReaderToPiexif = (
  exifReaderData: Exif,
  originalThumbnail: string | null | undefined,
): piexif.IExif => {
  const piexifData: piexif.IExif = {
    '0th': {},
    Exif: {},
    GPS: {},
    '1st': {},
    Interop: {},
    thumbnail: originalThumbnail || undefined,
  }

  const findTagDetails = (
    tagName: string,
    ifdName: string,
  ): { code: number; ifd: string } | undefined => {
    const ifd = (piexif.Tags as any)[ifdName] as Record<
      string,
      { name: string; type: number }
    >
    if (!ifd) return undefined
    for (const code in ifd) {
      if (ifd[code].name === tagName) {
        return { code: Number(code), ifd: ifdName }
      }
    }
    return undefined
  }

  // Process Image data (goes to 0th or Exif)
  if (exifReaderData.Image) {
    for (const tagName in exifReaderData.Image) {
      const value = exifReaderData.Image[tagName]
      const tagDetails =
        findTagDetails(tagName, 'Image') ?? findTagDetails(tagName, 'Exif')
      if (tagDetails) {
        const destIfd =
          tagDetails.ifd === 'Image'
            ? piexifData['0th']
            : (piexifData[tagDetails.ifd as keyof piexif.IExif] as Record<
                number,
                piexif.IExifElement
              >)
        if (destIfd) {
          destIfd[tagDetails.code] = convertValueToPiexifFormat(tagName, value)
        }
      }
    }
  }

  // Process Photo data (goes to Exif)
  if (exifReaderData.Photo) {
    for (const tagName in exifReaderData.Photo) {
      const value = exifReaderData.Photo[tagName]
      const tagDetails = findTagDetails(tagName, 'Exif')
      if (tagDetails && piexifData.Exif) {
        piexifData.Exif[tagDetails.code] = convertValueToPiexifFormat(
          tagName,
          value,
        )
      }
    }
  }

  // Process ThumbnailTags (goes to 1st)
  if (exifReaderData.ThumbnailTags) {
    for (const tagName in exifReaderData.ThumbnailTags) {
      const value = exifReaderData.ThumbnailTags[tagName]
      const tagDetails = findTagDetails(tagName, 'FirstIFD')
      if (tagDetails && piexifData['1st']) {
        piexifData['1st'][tagDetails.code] = convertValueToPiexifFormat(
          tagName,
          value,
        )
      }
    }
  }

  // Process GPSInfo (goes to GPS)
  if (exifReaderData.GPSInfo) {
    for (const tagName in exifReaderData.GPSInfo) {
      const value = exifReaderData.GPSInfo[tagName]
      const tagDetails = findTagDetails(tagName, 'GPS')
      if (tagDetails && piexifData.GPS) {
        piexifData.GPS[tagDetails.code] = convertValueToPiexifFormat(
          tagName,
          value,
        )
      }
    }
  }

  // Process Iop (goes to Interop)
  if (exifReaderData.Iop) {
    for (const tagName in exifReaderData.Iop) {
      const value = exifReaderData.Iop[tagName]
      const tagDetails = findTagDetails(tagName, 'Interop')
      if (tagDetails && piexifData.Interop) {
        piexifData.Interop[tagDetails.code] = convertValueToPiexifFormat(
          tagName,
          value,
        )
      }
    }
  }

  return piexifData
}
