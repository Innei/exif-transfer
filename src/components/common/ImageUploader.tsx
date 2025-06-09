import type { DragEvent } from 'react'
import { useCallback } from 'react'

export interface ImageState {
  file: File | null
  previewUrl: string | null
}

export const ImageUploader = ({
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
