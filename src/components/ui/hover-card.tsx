'use client'

import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import * as React from 'react'

import { clsxm as cn } from '~/lib/cn'

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = ({
  ref,
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & {
  ref?: React.RefObject<React.ElementRef<
    typeof HoverCardPrimitive.Content
  > | null>
}) => (
  <HoverCardPrimitive.HoverCardPortal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-64 rounded-md border border-border bg-material-medium backdrop-blur-background p-4 text-text shadow-md outline-none',
        className,
      )}
      {...props}
    />
  </HoverCardPrimitive.HoverCardPortal>
)
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardContent, HoverCardTrigger }
