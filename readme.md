# EXIF Transfer

A modern web application for transferring EXIF metadata between images. Built with React, TypeScript, and TailwindCSS, featuring an intuitive drag-and-drop interface for photographers and image processing workflows.

## ✨ Features

### 📸 EXIF Data Management

- **Extract EXIF Data** - Read comprehensive metadata from source images
- **Transfer EXIF Data** - Copy metadata between different images seamlessly
- **Preserve Image Quality** - Lossless EXIF operations without image degradation
- **Multiple Format Support** - Works with JPEG, PNG and other common formats
- **Detailed EXIF Display** - View organized metadata with human-readable labels

### 🎨 Modern Interface

- **Drag & Drop Upload** - Intuitive file upload experience with visual feedback
- **Real-time Preview** - Instant image and EXIF data visualization
- **Dark/Light Theme** - System preference aware theme switching
- **Responsive Design** - Mobile-first approach optimized for all devices
- **Interactive EXIF Viewer** - Collapsible sections with organized metadata display

### 🚀 Technical Stack

- **Vite 6** - Lightning-fast build tool with Hot Module Replacement
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and IntelliSense support
- **TailwindCSS 4** - Utility-first CSS with modern design system
- **EXIF Libraries** - `exif-reader` and `piexif-ts` for robust metadata handling

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

1. **Upload Source Image** - Drag and drop or click to select an image with EXIF data
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
│       └── ExifDisplay.tsx  # EXIF metadata display component
├── pages/              # Application pages
│   └── (main)/         # Main EXIF transfer interface
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
│   ├── exif-tags.ts    # EXIF tag mapping and translations
│   └── cn.ts           # Class name utilities
├── providers/          # Context providers
├── atoms/              # Jotai state management
└── styles/             # Global styles and Tailwind config
```

## 🔧 Key Components

### EXIF Display (`ExifDisplay.tsx`)

- Organized metadata display with collapsible sections
- Human-readable tag names and value formatting
- Support for binary data and complex EXIF structures
- Responsive grid layout for optimal viewing

### Image Uploader

- Drag and drop functionality with visual feedback
- Image preview with proper aspect ratio handling
- File type validation for supported formats
- Error handling for invalid or corrupted images

### EXIF Processing

- Robust metadata extraction using `exif-reader`
- Metadata injection with `piexif-ts` library
- Binary data handling and encoding/decoding
- Error handling for various edge cases

## 🎨 EXIF Data Support

The application handles comprehensive EXIF metadata including:

- **Camera Settings** - Aperture, shutter speed, ISO, focal length
- **Image Details** - Resolution, color space, orientation
- **GPS Information** - Location coordinates and altitude
- **Timestamps** - Creation and modification dates
- **Equipment Info** - Camera make, model, lens information
- **Technical Data** - White balance, exposure mode, flash settings

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

> [Personal Website](https://innei.ren/) · GitHub [@Innei](https://github.com/innei/)
