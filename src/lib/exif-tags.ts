export const exifTagMap: Record<string, string> = {
  // Sections
  '0th': 'Image',
  '1st': 'Thumbnail',
  IFD0: 'Image',
  IFD1: 'Thumbnail',
  Exif: 'Exif',
  GPS: 'GPS',
  Interop: 'Interoperability',
  General: 'General',

  // Image
  ImageWidth: 'Image Width',
  ImageHeight: 'Image Height',
  BitsPerSample: 'Bits Per Sample',
  Compression: 'Compression',
  PhotometricInterpretation: 'Photometric Interpretation',
  Orientation: 'Orientation',
  SamplesPerPixel: 'Samples Per Pixel',
  PlanarConfiguration: 'Planar Configuration',
  YCbCrSubSampling: 'YCbCr Sub Sampling',
  YCbCrPositioning: 'YCbCr Positioning',
  XResolution: 'X Resolution',
  YResolution: 'Y Resolution',
  ResolutionUnit: 'Resolution Unit',
  StripOffsets: 'Strip Offsets',
  RowsPerStrip: 'Rows Per Strip',
  StripByteCounts: 'Strip Byte Counts',
  JPEGInterchangeFormat: 'JPEG Interchange Format',
  JPEGInterchangeFormatLength: 'JPEG Interchange Format Length',
  TransferFunction: 'Transfer Function',
  WhitePoint: 'White Point',
  PrimaryChromaticities: 'Primary Chromaticities',
  YCbCrCoefficients: 'YCbCr Coefficients',
  ReferenceBlackWhite: 'Reference Black White',
  DateTime: 'Date Time',
  ImageDescription: 'Image Description',
  Make: 'Make',
  Model: 'Model',
  Software: 'Software',
  Artist: 'Artist',
  Copyright: 'Copyright',
  HostComputer: 'Host Computer',
  ProcessingSoftware: 'Processing Software',
  Predictor: 'Predictor',
  TileWidth: 'Tile Width',
  TileLength: 'Tile Length',
  TileOffsets: 'Tile Offsets',
  TileByteCounts: 'Tile Byte Counts',
  ExtraSamples: 'Extra Samples',
  SampleFormat: 'Sample Format',
  SMinSampleValue: 'S Min Sample Value',
  SMaxSampleValue: 'S Max Sample Value',
  InkSet: 'Ink Set',
  InkNames: 'Ink Names',
  NumberOfInks: 'Number Of Inks',
  DotRange: 'Dot Range',
  TargetPrinter: 'Target Printer',
  Threshholding: 'Threshholding',
  CellWidth: 'Cell Width',
  CellLength: 'Cell Length',
  FillOrder: 'Fill Order',
  DocumentName: 'Document Name',
  ImageDepth: 'Image Depth',
  TileDepth: 'Tile Depth',

  // Exif
  ExposureTime: 'Exposure Time',
  FNumber: 'F Number',
  ExposureProgram: 'Exposure Program',
  SpectralSensitivity: 'Spectral Sensitivity',
  ISOSpeedRatings: 'ISO Speed Ratings',
  ISO: 'ISO',
  PhotographicSensitivity: 'Photographic Sensitivity',
  SensitivityType: 'Sensitivity Type',
  StandardOutputSensitivity: 'Standard Output Sensitivity',
  RecommendedExposureIndex: 'Recommended Exposure Index',
  ISOSpeed: 'ISO Speed',
  ISOSpeedLatitudeyyy: 'ISO Speed Latitude yyy',
  ISOSpeedLatitudezzz: 'ISO Speed Latitude zzz',
  OECF: 'OECF',
  ExifVersion: 'Exif Version',
  DateTimeOriginal: 'Date Time Original',
  DateTimeDigitized: 'Date Time Digitized',
  OffsetTime: 'Offset Time',
  OffsetTimeOriginal: 'Offset Time Original',
  OffsetTimeDigitized: 'Offset Time Digitized',
  ComponentsConfiguration: 'Components Configuration',
  CompressedBitsPerPixel: 'Compressed Bits Per Pixel',
  ShutterSpeedValue: 'Shutter Speed Value',
  ApertureValue: 'Aperture Value',
  BrightnessValue: 'Brightness Value',
  ExposureBiasValue: 'Exposure Bias Value',
  MaxApertureValue: 'Max Aperture Value',
  SubjectDistance: 'Subject Distance',
  MeteringMode: 'Metering Mode',
  LightSource: 'Light Source',
  Flash: 'Flash',
  FocalLength: 'Focal Length',
  SubjectArea: 'Subject Area',
  MakerNote: 'Maker Note',
  UserComment: 'User Comment',
  SubSecTime: 'Sub Sec Time',
  SubSecTimeOriginal: 'Sub Sec Time Original',
  SubSecTimeDigitized: 'Sub Sec Time Digitized',
  FlashpixVersion: 'Flashpix Version',
  ColorSpace: 'Color Space',
  PixelXDimension: 'Pixel X Dimension',
  PixelYDimension: 'Pixel Y Dimension',
  RelatedSoundFile: 'Related Sound File',
  FlashEnergy: 'Flash Energy',
  SpatialFrequencyResponse: 'Spatial Frequency Response',
  FocalPlaneXResolution: 'Focal Plane X Resolution',
  FocalPlaneYResolution: 'Focal Plane Y Resolution',
  FocalPlaneResolutionUnit: 'Focal Plane Resolution Unit',
  SubjectLocation: 'Subject Location',
  ExposureIndex: 'Exposure Index',
  SensingMethod: 'Sensing Method',
  FileSource: 'File Source',
  SceneType: 'Scene Type',
  CFAPattern: 'CFA Pattern',
  CustomRendered: 'Custom Rendered',
  ExposureMode: 'Exposure Mode',
  WhiteBalance: 'White Balance',
  DigitalZoomRatio: 'Digital Zoom Ratio',
  FocalLengthIn35mmFilm: 'Focal Length In 35mm Film',
  SceneCaptureType: 'Scene Capture Type',
  GainControl: 'Gain Control',
  Contrast: 'Contrast',
  Saturation: 'Saturation',
  Sharpness: 'Sharpness',
  DeviceSettingDescription: 'Device Setting Description',
  SubjectDistanceRange: 'Subject Distance Range',
  ImageUniqueID: 'Image Unique ID',
  CameraOwnerName: 'Camera Owner Name',
  BodySerialNumber: 'Body Serial Number',
  LensSpecification: 'Lens Specification',
  LensMake: 'Lens Make',
  LensModel: 'Lens Model',
  LensSerialNumber: 'Lens Serial Number',
  Gamma: 'Gamma',
  Temperature: 'Temperature',
  Humidity: 'Humidity',
  Pressure: 'Pressure',
  WaterDepth: 'Water Depth',
  Acceleration: 'Acceleration',
  CameraElevationAngle: 'Camera Elevation Angle',

  // Extended EXIF tags
  PrintImageMatching: 'Print Image Matching',
  DNGVersion: 'DNG Version',
  DNGBackwardVersion: 'DNG Backward Version',
  UniqueCameraModel: 'Unique Camera Model',
  LocalizedCameraModel: 'Localized Camera Model',
  CFAPlaneColor: 'CFA Plane Color',
  CFALayout: 'CFA Layout',
  LinearizationTable: 'Linearization Table',
  BlackLevelRepeatDim: 'Black Level Repeat Dim',
  BlackLevel: 'Black Level',
  BlackLevelDeltaH: 'Black Level Delta H',
  BlackLevelDeltaV: 'Black Level Delta V',
  WhiteLevel: 'White Level',
  DefaultScale: 'Default Scale',
  DefaultCropOrigin: 'Default Crop Origin',
  DefaultCropSize: 'Default Crop Size',
  ColorMatrix1: 'Color Matrix 1',
  ColorMatrix2: 'Color Matrix 2',
  CameraCalibration1: 'Camera Calibration 1',
  CameraCalibration2: 'Camera Calibration 2',
  ReductionMatrix1: 'Reduction Matrix 1',
  ReductionMatrix2: 'Reduction Matrix 2',
  AnalogBalance: 'Analog Balance',
  AsShotNeutral: 'As Shot Neutral',
  AsShotWhiteXY: 'As Shot White XY',
  BaselineExposure: 'Baseline Exposure',
  BaselineNoise: 'Baseline Noise',
  BaselineSharpness: 'Baseline Sharpness',
  BayerGreenSplit: 'Bayer Green Split',
  LinearResponseLimit: 'Linear Response Limit',
  CameraSerialNumber: 'Camera Serial Number',
  DNGLensInfo: 'DNG Lens Info',
  ChromaBlurRadius: 'Chroma Blur Radius',
  AntiAliasStrength: 'Anti Alias Strength',
  ShadowScale: 'Shadow Scale',
  DNGPrivateData: 'DNG Private Data',
  MakerNoteSafety: 'Maker Note Safety',
  CalibrationIlluminant1: 'Calibration Illuminant 1',
  CalibrationIlluminant2: 'Calibration Illuminant 2',
  BestQualityScale: 'Best Quality Scale',
  RawDataUniqueID: 'Raw Data Unique ID',
  AliasLayerMetadata: 'Alias Layer Metadata',
  OriginalRawFileName: 'Original Raw File Name',
  OriginalRawFileData: 'Original Raw File Data',
  ActiveArea: 'Active Area',
  MaskedAreas: 'Masked Areas',
  AsShotICCProfile: 'As Shot ICC Profile',
  AsShotPreProfileMatrix: 'As Shot Pre Profile Matrix',
  CurrentICCProfile: 'Current ICC Profile',
  CurrentPreProfileMatrix: 'Current Pre Profile Matrix',

  // Fujifilm specific tags
  FilmMode: 'Film Mode',
  FilmSimulation: 'Film Simulation',
  FilmGrain: 'Film Grain',
  FilmStrength: 'Film Strength',
  FilmTone: 'Film Tone',
  FilmShadow: 'Film Shadow',
  FilmHighlight: 'Film Highlight',
  FilmColor: 'Film Color',
  FilmSharpness: 'Film Sharpness',
  FilmClarity: 'Film Clarity',
  FilmWhiteBalance: 'Film White Balance',
  FilmNoiseReduction: 'Film Noise Reduction',
  DynamicRange: 'Dynamic Range',
  DynamicRangeSetting: 'Dynamic Range Setting',
  DRangePriority: 'D Range Priority',
  DRangePriorityAuto: 'D Range Priority Auto',
  DRangePriorityFixed: 'D Range Priority Fixed',
  HighlightTone: 'Highlight Tone',
  ShadowTone: 'Shadow Tone',
  ColorSaturation: 'Color Saturation',
  ChromaticAberrationCorrection: 'Chromatic Aberration Correction',
  DistortionCorrection: 'Distortion Correction',
  VignettingCorrection: 'Vignetting Correction',
  PictureMode: 'Picture Mode',
  ShootingMode: 'Shooting Mode',
  AutoBracketing: 'Auto Bracketing',
  SequenceNumber: 'Sequence Number',
  DriveMode: 'Drive Mode',
  FocusMode: 'Focus Mode',
  AFMode: 'AF Mode',
  FocusPixel: 'Focus Pixel',
  ImageStabilization: 'Image Stabilization',
  MacroMode: 'Macro Mode',
  FlashMode: 'Flash Mode',
  FlashSetting: 'Flash Setting',
  FlashStrength: 'Flash Strength',
  FlashCommanderMode: 'Flash Commander Mode',
  FlashExposureComp: 'Flash Exposure Comp',
  FaceDetectionMode: 'Face Detection Mode',
  FaceRecognition: 'Face Recognition',
  FaceElementSelected: 'Face Element Selected',
  FaceElementTypes: 'Face Element Types',
  FaceElementPositions: 'Face Element Positions',
  FaceElementNames: 'Face Element Names',

  // Color and tone adjustments
  ColorMode: 'Color Mode',
  ColorFilter: 'Color Filter',
  ColorTemperature: 'Color Temperature',
  ColorCompensationFilter: 'Color Compensation Filter',
  WBFineTuneRed: 'WB Fine Tune Red',
  WBFineTuneBlue: 'WB Fine Tune Blue',
  NoiseReduction: 'Noise Reduction',
  LongExposureNoiseReduction: 'Long Exposure Noise Reduction',
  HighISONoiseReduction: 'High ISO Noise Reduction',
  ShadowNoiseReduction: 'Shadow Noise Reduction',

  // Lens information
  LensType: 'Lens Type',
  LensID: 'Lens ID',
  LensInfo: 'Lens Info',
  MinFocalLength: 'Min Focal Length',
  MaxFocalLength: 'Max Focal Length',
  MaxApertureAtMinFocal: 'Max Aperture At Min Focal',
  MaxApertureAtMaxFocal: 'Max Aperture At Max Focal',
  LensFStops: 'Lens F Stops',
  MCUVersion: 'MCU Version',
  LensDistortionParams: 'Lens Distortion Params',
  LensModulationOptimizer: 'Lens Modulation Optimizer',

  // GPS
  GPSVersionID: 'GPS Version ID',
  GPSLatitudeRef: 'GPS Latitude Ref',
  GPSLatitude: 'GPS Latitude',
  GPSLongitudeRef: 'GPS Longitude Ref',
  GPSLongitude: 'GPS Longitude',
  GPSAltitudeRef: 'GPS Altitude Ref',
  GPSAltitude: 'GPS Altitude',
  GPSTimeStamp: 'GPS TimeStamp',
  GPSSatellites: 'GPS Satellites',
  GPSStatus: 'GPS Status',
  GPSMeasureMode: 'GPS Measure Mode',
  GPSDOP: 'GPS DOP',
  GPSSpeedRef: 'GPS Speed Ref',
  GPSSpeed: 'GPS Speed',
  GPSTrackRef: 'GPS Track Ref',
  GPSTrack: 'GPS Track',
  GPSImgDirectionRef: 'GPS Img Direction Ref',
  GPSImgDirection: 'GPS Img Direction',
  GPSMapDatum: 'GPS Map Datum',
  GPSDestLatitudeRef: 'GPS Dest Latitude Ref',
  GPSDestLatitude: 'GPS Dest Latitude',
  GPSDestLongitudeRef: 'GPS Dest Longitude Ref',
  GPSDestLongitude: 'GPS Dest Longitude',
  GPSDestBearingRef: 'GPS Dest Bearing Ref',
  GPSDestBearing: 'GPS Dest Bearing',
  GPSDestDistanceRef: 'GPS Dest Distance Ref',
  GPSDestDistance: 'GPS Dest Distance',
  GPSProcessingMethod: 'GPS Processing Method',
  GPSAreaInformation: 'GPS Area Information',
  GPSDateStamp: 'GPS Date Stamp',
  GPSDifferential: 'GPS Differential',
  GPSHPositioningError: 'GPS HPositioning Error',
}

// Fuji Film Simulation mapping for better readability
export const fujiFilmSimulationMap: Record<string, string> = {
  PROVIA: 'Provia (Standard)',
  Velvia: 'Velvia (Vivid)',
  ASTIA: 'Astia (Soft)',
  CLASSIC_CHROME: 'Classic Chrome',
  PRO_Neg_Hi: 'Pro Neg. Hi',
  PRO_Neg_Std: 'Pro Neg. Std',
  CLASSIC_NEG: 'Classic Neg.',
  ETERNA: 'Eterna (Cinema)',
  ACROS: 'Acros (B&W)',
  ACROS_Ye: 'Acros+Ye Filter',
  ACROS_R: 'Acros+R Filter',
  ACROS_G: 'Acros+G Filter',
  MONOCHROME: 'Monochrome',
  MONOCHROME_Ye: 'Monochrome+Ye Filter',
  MONOCHROME_R: 'Monochrome+R Filter',
  MONOCHROME_G: 'Monochrome+G Filter',
  SEPIA: 'Sepia',
  NOSTALGIC_NEG: 'Nostalgic Neg.',
  BLEACH_BYPASS: 'Bleach Bypass',
  REALA_ACE: 'Reala Ace',
}

// Dynamic Range mapping
export const fujiDynamicRangeMap: Record<string, string> = {
  '100': 'DR100',
  '200': 'DR200',
  '400': 'DR400',
  AUTO: 'DR Auto',
}

// Exposure Program mapping
export const exposureProgramMap: Record<number, string> = {
  0: 'Not Defined',
  1: 'Manual',
  2: 'Program AE',
  3: 'Aperture Priority',
  4: 'Shutter Priority',
  5: 'Creative Program',
  6: 'Action Program',
  7: 'Portrait Mode',
  8: 'Landscape Mode',
  9: 'Bulb',
}

// Metering Mode mapping
export const meteringModeMap: Record<number, string> = {
  0: 'Unknown',
  1: 'Average',
  2: 'Center Weighted Average',
  3: 'Spot',
  4: 'Multi Spot',
  5: 'Multi Segment',
  6: 'Partial',
  255: 'Other',
}

// Flash mapping
export const flashMap: Record<number, string> = {
  0: 'No Flash',
  1: 'Flash',
  5: 'Flash, No Strobe Return',
  7: 'Flash, Strobe Return',
  8: 'On, Did not fire',
  9: 'On, Fired',
  13: 'On, No Strobe Return',
  15: 'On, Strobe Return',
  16: 'Off, Did not fire',
  20: 'Off, Did not fire, No Return',
  24: 'Auto, Did not fire',
  25: 'Auto, Fired',
  29: 'Auto, Fired, No Return',
  31: 'Auto, Fired, Return',
  32: 'No Flash Function',
  48: 'Off, No Flash Function',
  65: 'Red Eye Reduction',
  69: 'Red Eye Reduction, No Return',
  71: 'Red Eye Reduction, Return',
  73: 'Red Eye Reduction, Fired',
  77: 'Red Eye Reduction, Fired, No Return',
  79: 'Red Eye Reduction, Fired, Return',
  80: 'Off, Red Eye Reduction',
  88: 'Auto, Red Eye Reduction',
  89: 'Auto, Red Eye Reduction, Fired',
  93: 'Auto, Red Eye Reduction, Fired, No Return',
  95: 'Auto, Red Eye Reduction, Fired, Return',
}

// White Balance mapping
export const whiteBalanceMap: Record<number, string> = {
  0: 'Auto',
  1: 'Manual',
  2: 'Daylight',
  3: 'Cloudy',
  4: 'Tungsten',
  5: 'Fluorescent',
  6: 'Flash',
  7: 'Shade',
  8: 'Kelvin',
  9: 'Manual 2',
  10: 'Manual 3',
}

// Color Space mapping
export const colorSpaceMap: Record<number, string> = {
  1: 'sRGB',
  2: 'Adobe RGB',
  65535: 'Uncalibrated',
}

// Orientation mapping
export const orientationMap: Record<number, string> = {
  1: 'Normal',
  2: 'Flipped Horizontally',
  3: 'Rotated 180°',
  4: 'Flipped Vertically',
  5: 'Rotated 90° CCW, Flipped Horizontally',
  6: 'Rotated 90° CW',
  7: 'Rotated 90° CW, Flipped Horizontally',
  8: 'Rotated 90° CCW',
}
export const fujiRecipeKeyMap: Record<string, string> = {
  FilmMode: 'Film Mode',
  GrainEffectRoughness: 'Grain Effect Roughness',
  GrainEffectSize: 'Grain Effect Size',
  ColorChromeEffect: 'Color Chrome Effect',
  ColorChromeFxBlue: 'Color Chrome Fx Blue',
  WhiteBalance: 'White Balance',
  DynamicRange: 'Dynamic Range',
  HighlightTone: 'Highlight Tone',
  ShadowTone: 'Shadow Tone',
  Saturation: 'Saturation',
  Sharpness: 'Sharpness',
  NoiseReduction: 'Noise Reduction',
  Clarity: 'Clarity',
}
