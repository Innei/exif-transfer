import * as piexif from 'piexif-ts'

const nameToTagMap: Record<string, { tag: number; ifd: string }> = {}
for (const ifd in piexif.Tags) {
  for (const tag in piexif.Tags[ifd]) {
    nameToTagMap[piexif.Tags[ifd][tag].name] = {
      tag: Number.parseInt(tag, 10),
      ifd,
    }
  }
}

const exifReaderIfdToPiexifIfd: Record<string, string> = {
  Image: '0th',
  Photo: 'Exif',
  GPS: 'GPS',
}

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
  exifReaderData: Record<string, any>,
  originalThumbnail: string | null | undefined,
) => {
  const piexifData: piexif.IExif = {
    '0th': {},
    Exif: {},
    GPS: {},
    '1st': {},
    thumbnail: originalThumbnail || undefined,
  }

  for (const exifReaderIfdName in exifReaderData) {
    const piexifIfdName = exifReaderIfdToPiexifIfd[exifReaderIfdName]
    if (!piexifIfdName || !piexifData[piexifIfdName]) continue

    const ifdData = exifReaderData[exifReaderIfdName]
    for (const tagName in ifdData) {
      const tagInfo = nameToTagMap[tagName]
      if (tagInfo) {
        let belongsToCurrentIfd = false
        if (exifReaderIfdName === 'Image' && tagInfo.ifd === 'Image') {
          belongsToCurrentIfd = true
        } else if (exifReaderIfdName === 'Photo' && tagInfo.ifd === 'Exif') {
          belongsToCurrentIfd = true
        } else if (exifReaderIfdName === 'GPS' && tagInfo.ifd === 'GPS') {
          belongsToCurrentIfd = true
        }

        if (belongsToCurrentIfd) {
          const originalValue = ifdData[tagName]
          const convertedValue = convertValueToPiexifFormat(
            tagName,
            originalValue,
          )
          piexifData[piexifIfdName]![tagInfo.tag] = convertedValue
        }
      }
    }
  }
  return piexifData
}
