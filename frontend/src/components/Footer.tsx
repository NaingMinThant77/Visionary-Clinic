import { Heart, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

import { AboutUsDialog, ContactUsDialog } from "@/components/InfoDialogs";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="relative mt-auto overflow-hidden rounded-t-3xl border-t border-primary/10 bg-secondary/60 shadow-[0_-8px_24px_-16px_hsl(var(--primary)/0.35)]">
      <div className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-accent/60 blur-3xl" />

      <div className="container relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link
            to="/"
            className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Stethoscope className="h-4 w-4" />
            </span>
            Visionary Clinic
          </Link>
          <p className="text-sm text-muted-foreground">
            Find doctors, book appointments, and manage your visits in one
            place.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Care</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/doctors"
                className="transition-colors hover:text-primary"
              >
                Find a doctor
              </Link>
            </li>
            <li>
              <Link
                to="/bookings"
                className="transition-colors hover:text-primary"
              >
                My appointments
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Account</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {isAuthenticated ? (
              <li>
                <Link
                  to="/profile"
                  className="transition-colors hover:text-primary"
                >
                  My profile
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="transition-colors hover:text-primary"
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="transition-colors hover:text-primary"
                  >
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <AboutUsDialog>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  About Us
                </button>
              </AboutUsDialog>
            </li>
            <li>
              <ContactUsDialog>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                >
                  Contact Us
                </button>
              </ContactUsDialog>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-1.5 border-t border-primary/10 py-5 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-4">
        <p>
          © {new Date().getFullYear()} Visionary Clinic. All rights reserved.
        </p>
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 fill-primary text-primary" /> for
          better patient care
        </p>
      </div>
    </footer>
  );
}
