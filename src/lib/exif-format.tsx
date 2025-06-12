import {
  colorSpaceMap,
  exposureProgramMap,
  flashMap,
  fujiDynamicRangeMap,
  fujiFilmSimulationMap,
  meteringModeMap,
  orientationMap,
  whiteBalanceMap,
} from '~/lib/exif-tags'

import { BinaryDataViewer } from '../components/common/BinaryDataViewer'

export const formatValue = (
  key: string,
  value: unknown,
): string | React.ReactNode => {
  if (value instanceof Date) {
    return value.toLocaleString()
  }
  if (value instanceof Uint8Array) {
    try {
      const str = new TextDecoder().decode(value)
      // eslint-disable-next-line no-control-regex
      if (/[\x00-\x08\x0E-\x1F]/.test(str)) {
        return <BinaryDataViewer value={value} />
      }
      return str.replace(/\0+$/, '') // remove trailing null chars
    } catch {
      return <BinaryDataViewer value={value} />
    }
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'number')) {
      return value.join(', ')
    }
    return JSON.stringify(value)
  }

  // Apply specific value mappings based on the key
  if (typeof value === 'number') {
    switch (key) {
      case 'ExposureProgram': {
        return exposureProgramMap[value] || `Unknown (${value})`
      }
      case 'MeteringMode': {
        return meteringModeMap[value] || `Unknown (${value})`
      }
      case 'Flash': {
        return flashMap[value] || `Unknown (${value})`
      }
      case 'WhiteBalance': {
        return whiteBalanceMap[value] || `Unknown (${value})`
      }
      case 'ColorSpace': {
        return colorSpaceMap[value] || `Unknown (${value})`
      }
      case 'Orientation': {
        return orientationMap[value] || `Unknown (${value})`
      }
    }
  }

  // Format exposure time
  if (key === 'ExposureTime' && typeof value === 'number') {
    if (value < 1) {
      return `1/${Math.round(1 / value)}s`
    }
    return `${value}s`
  }

  // Format F-number
  if (key === 'FNumber' && typeof value === 'number') {
    return `f/${value}`
  }

  // Format focal length
  if (key === 'FocalLength' && typeof value === 'number') {
    return `${value}mm`
  }

  // Format ISO
  if (
    (key === 'ISOSpeedRatings' ||
      key === 'ISO' ||
      key === 'PhotographicSensitivity') &&
    typeof value === 'number'
  ) {
    return `ISO ${value}`
  }

  // Format exposure bias
  if (key === 'ExposureBiasValue' && typeof value === 'number') {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)} EV`
  }

  // Format resolution
  if (
    (key === 'XResolution' || key === 'YResolution') &&
    typeof value === 'number'
  ) {
    return `${value} dpi`
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }

  return String(value)
}

// Format Fuji Recipe values for better readability
export const formatFujiRecipeValue = (
  key: string,
  value: unknown,
): string | React.ReactNode => {
  if (typeof value === 'string') {
    // Film simulation mapping
    if (
      key.toLowerCase().includes('film') ||
      key.toLowerCase().includes('simulation')
    ) {
      return fujiFilmSimulationMap[value] || value
    }
    // Dynamic range mapping
    if (
      key.toLowerCase().includes('dynamic') ||
      key.toLowerCase().includes('range')
    ) {
      return fujiDynamicRangeMap[value] || value
    }
  }

  if (typeof value === 'number') {
    // Format specific numeric values
    if (key.toLowerCase().includes('temperature') && value > 1000) {
      return `${value}K`
    }
    if (
      key.toLowerCase().includes('tint') ||
      key.toLowerCase().includes('fine')
    ) {
      const sign = value >= 0 ? '+' : ''
      return `${sign}${value}`
    }
  }

  return formatValue(key, value)
}

const reverseMap = (map: Record<number, string>): Record<string, number> => {
  const reversed: Record<string, number> = {}
  for (const [key, value] of Object.entries(map)) {
    reversed[value] = Number(key)
  }
  return reversed
}

const reversedExposureProgramMap = reverseMap(exposureProgramMap)
const reversedMeteringModeMap = reverseMap(meteringModeMap)
const reversedFlashMap = reverseMap(flashMap)
const reversedWhiteBalanceMap = reverseMap(whiteBalanceMap)
const reversedColorSpaceMap = reverseMap(colorSpaceMap)
const reversedOrientationMap = reverseMap(orientationMap)
const reversedFujiFilmSimulationMap = reverseMap(fujiFilmSimulationMap)
const reversedFujiDynamicRangeMap = reverseMap(fujiDynamicRangeMap)

export const unformatValue = (
  key: string,
  value: string,
  originalValue: any,
) => {
  if (typeof value !== 'string') return originalValue
  if (reversedExposureProgramMap[value])
    return reversedExposureProgramMap[value]
  if (reversedMeteringModeMap[value]) return reversedMeteringModeMap[value]
  if (reversedFlashMap[value]) return reversedFlashMap[value]
  if (reversedWhiteBalanceMap[value]) return reversedWhiteBalanceMap[value]
  if (reversedColorSpaceMap[value]) return reversedColorSpaceMap[value]
  if (reversedOrientationMap[value]) return reversedOrientationMap[value]
  if (reversedFujiFilmSimulationMap[value])
    return reversedFujiFilmSimulationMap[value]
  if (reversedFujiDynamicRangeMap[value])
    return reversedFujiDynamicRangeMap[value]

  if (key === 'ExposureTime') {
    if (value.startsWith('1/')) {
      return 1 / Number(value.slice(2, -1))
    }
    return Number(value.slice(0, -1))
  }
  if (key === 'FNumber') {
    return Number(value.slice(2))
  }
  if (key === 'FocalLength') {
    return Number(value.slice(0, -2))
  }
  if (key.startsWith('ISO')) {
    return Number(value.slice(4))
  }
  if (key === 'ExposureBiasValue') {
    return Number(value.split(' ')[0])
  }
  if (key.endsWith('Resolution')) {
    return Number(value.split(' ')[0])
  }

  if (originalValue instanceof Date) {
    return new Date(value)
  }

  if (typeof originalValue === 'number') {
    return Number(value)
  }

  return value
}
