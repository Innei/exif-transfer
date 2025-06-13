# EXIF Transfer & Editor

A modern web application for reading, editing, and transferring EXIF metadata between images. Built with React, TypeScript, and TailwindCSS, featuring an intuitive drag-and-drop interface for photographers and image processing workflows.

## ✨ Features

### 📸 EXIF Data Management

- **Read & Edit EXIF Data** - View and modify comprehensive metadata from images with an interactive editor
- **Transfer EXIF Data** - Copy metadata between different images seamlessly
- **Preserve Image Quality** - Lossless EXIF operations without image degradation
- **Multiple Format Support** - Works with JPEG, PNG and other common formats
- **Detailed EXIF Display** - View organized metadata with human-readable labels and collapsible sections
- **GPS Data Control** - Option to preserve or remove GPS location information
- **Fuji Film Simulation Support** - Special handling for Fujifilm camera recipes and film simulations

### 🎨 Modern Interface

- **Dual Mode Operation** - Separate modes for EXIF editing and data transfer
- **Drag & Drop Upload** - Intuitive file upload experience with visual feedback
- **Real-time Preview** - Instant image and EXIF data visualization
- **Interactive EXIF Editor** - Click-to-edit functionality for modifying metadata values
- **Dark/Light Theme** - System preference aware theme switching
- **Responsive Design** - Mobile-first approach optimized for all devices
- **Export Options** - Download processed images or export EXIF data as JSON

### 🚀 Technical Stack

- **Vite 6** - Lightning-fast build tool with Hot Module Replacement
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and IntelliSense support
- **TailwindCSS 4** - Utility-first CSS with modern design system
- **EXIF Libraries** - `exif-reader` and `piexif-ts` for robust metadata handling
- **Fuji Recipes** - `fuji-recipes` library for Fujifilm film simulation support

### 🛠️ Developer Experience

- **ESLint + Prettier** - Consistent code formatting and linting
- **Git Hooks** - Pre-commit hooks with lint-staged for quality assurance
- **Modern Tooling** - Optimized development workflow with hot reloading
- **TypeScript Config** - Strict type checking with path mapping support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/innei/exif-transfer
cd exif-transfer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🎯 How to Use

### EXIF Editor Mode (`/editor`)

1. **Upload Image** - Drag and drop or click to select an image with EXIF data
2. **View & Edit** - Browse organized EXIF sections and click on values to edit them
3. **GPS Control** - Choose to preserve or remove GPS location data
4. **Export Options** - Download the modified image or export EXIF data as JSON

### EXIF Transfer Mode (`/transfer`)

1. **Upload Source Image** - Select an image with EXIF data you want to copy
2. **Upload Target Image** - Select the image you want to add EXIF data to
3. **Transfer EXIF** - Click "Transfer EXIF" to copy metadata from source to target
4. **View Results** - Inspect the transferred EXIF data in the organized display
5. **Download** - Save the processed image with embedded EXIF metadata

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, accordion, etc.)
│   └── common/         # App-specific components
│       ├── ExifDisplay.tsx   # Interactive EXIF metadata display
│       ├── ImageUploader.tsx # Drag & drop image uploader
│       └── GpsDisplay.tsx    # GPS coordinate display
├── pages/              # Application pages
│   ├── reader/         # EXIF editor interface
│   └── transfer/       # EXIF transfer interface
├── hooks/              # Custom React hooks
│   └── useExif.ts      # EXIF data extraction hook
├── lib/                # Utility functions and configurations
│   ├── exif-tags.ts    # EXIF tag mapping and translations
│   ├── exif-converter.ts # EXIF format conversion utilities
│   └── cn.ts           # Class name utilities
├── providers/          # Context providers
├── atoms/              # Jotai state management
└── styles/             # Global styles and Tailwind config
```

## 🔧 Key Components

### Interactive EXIF Display (`ExifDisplay.tsx`)

- **Organized Sections** - Collapsible sections for different EXIF categories
- **Click-to-Edit** - Interactive editing of EXIF values with proper formatting
- **Human-Readable Labels** - Friendly names for technical EXIF tags
- **Value Formatting** - Automatic formatting for exposure, ISO, GPS coordinates, etc.
- **Fuji Recipe Support** - Special handling for Fujifilm film simulation data

### Image Uploader (`ImageUploader.tsx`)

- **Drag & Drop** - Visual feedback for file operations
- **Image Preview** - Immediate preview with proper aspect ratio
- **File Validation** - Support for JPEG, PNG, and other common formats
- **Error Handling** - Graceful handling of invalid or corrupted files

### EXIF Processing

- **Robust Extraction** - Uses `exif-reader` for comprehensive metadata reading
- **Metadata Injection** - `piexif-ts` library for embedding EXIF data
- **Format Conversion** - Seamless conversion between different EXIF formats
- **Binary Data Handling** - Proper encoding/decoding of complex EXIF structures

## 🎨 EXIF Data Support

The application handles comprehensive EXIF metadata including:

- **Camera Settings** - Aperture (f/stop), shutter speed, ISO sensitivity, focal length
- **Image Technical** - Resolution, color space, orientation, compression
- **GPS Information** - Latitude, longitude, altitude, timestamp
- **Timestamps** - Original capture time, modification dates
- **Equipment Details** - Camera make/model, lens information, firmware
- **Exposure Data** - Exposure mode, metering mode, white balance, flash settings
- **Fujifilm Specific** - Film simulation recipes, dynamic range settings

### Supported Formats & Values

- **Exposure Time** - Displayed as fractional seconds (e.g., "1/250s")
- **Aperture** - F-number format (e.g., "f/2.8")
- **ISO** - Standard ISO notation (e.g., "ISO 800")
- **Focal Length** - Millimeter notation (e.g., "50mm")
- **GPS Coordinates** - Decimal degrees with hemisphere indicators
- **Timestamps** - Localized date/time formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for photographers and image processing enthusiasts**

2025 © Innei, Released under the MIT License.

> [Personal Website](https://innei.in/) · GitHub [@Innei](https://github.com/innei/)
