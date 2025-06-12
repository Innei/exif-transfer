import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '~/components/ui/hover-card'

import { Divider } from '../ui/divider'

function toHex(value: Uint8Array): string {
  return Array.from(value)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}

function toAscii(value: Uint8Array): string {
  return String.fromCodePoint(...value)
}

export const BinaryDataViewer = ({ value }: { value: Uint8Array }) => {
  const hexValue = toHex(value)

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-help underline decoration-dotted">
          [Binary data: {value.length} bytes]
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-96">
        <div className="font-mono text-xs max-h-64 overflow-y-auto scrollbar-none">
          {hexValue}
        </div>
        <Divider />
        <div className="font-mono text-xs max-h-64 overflow-y-auto scrollbar-none mt-8">
          {toAscii(value)}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
