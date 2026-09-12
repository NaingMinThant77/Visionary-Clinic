import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AboutUsDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            About Us
          </DialogTitle>
          <DialogDescription className="text-foreground">
            Visionary Clinic helps patients find doctors, book appointments, and
            pay consultation fees online, while doctors manage their
            availability and see who's coming in.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export function ContactUsDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">
            Contact Us
          </DialogTitle>
          <DialogDescription className="text-foreground">
            Questions or feedback about this demo? Reach us anytime at{" "}
            <span className="font-medium text-primary">
              support@visionaryclinic.org
            </span>
            .
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
