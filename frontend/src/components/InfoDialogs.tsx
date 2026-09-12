import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AboutUsDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">About Us</DialogTitle>
          <DialogDescription className="text-foreground">
            Card Market is a practice marketplace built for competition prep — a sandbox where you can
            list, browse, and buy sample cards to try out a full-stack shopping flow end to end.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export function ContactUsDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Contact Us</DialogTitle>
          <DialogDescription className="text-foreground">
            Questions or feedback about this demo? Reach us anytime at{' '}
            <span className="font-medium text-primary">support@cardmarket.example</span>.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
