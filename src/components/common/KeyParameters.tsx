import { formatValue } from '~/lib/exif-format'

export const KeyParameters = ({
  keyParameters,
}: {
  keyParameters: Record<string, any>
}) => {
  if (Object.keys(keyParameters).length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Key Parameters</h2>
      <div className="grid grid-cols-2 @[30rem]:grid-cols-3 @[40rem]:grid-cols-4 gap-4">
        {Object.entries(keyParameters).map(([key, value]) => (
          <div
            key={key}
            className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {key}
            </p>
            <p className="text-md font-semibold text-zinc-900 dark:text-zinc-50">
              {formatValue(key, value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
