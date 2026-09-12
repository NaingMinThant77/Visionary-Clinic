import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Menu,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";

import { resolveAssetUrl } from "@/api/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";

const LOGO_MARK = (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
    <Stethoscope className="h-4 w-4" />
  </span>
);

export function Nav() {
  const { user, isAuthenticated, logout } = useAuth();
  const isDoctor = user?.role === "DOCTOR";
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/95 shadow-[0_6px_20px_-8px_hsl(var(--primary)/0.25)] backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-1">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full sm:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 rounded-r-3xl p-0">
              <div className="flex h-16 items-center gap-2 border-b border-primary/10 px-6">
                {LOGO_MARK}
                <SheetTitle className="font-display text-lg font-bold text-primary">
                  Visionary Clinic
                </SheetTitle>
              </div>
              <nav className="flex flex-col gap-1 p-4 text-sm font-semibold text-muted-foreground">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Home
                </Link>
                {isDoctor ? (
                  <>
                    <Link
                      to="/doctor/schedule"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      My Schedule
                    </Link>
                    <Link
                      to="/doctor/consultations"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Consultations
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/doctors"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Find Doctors
                    </Link>
                    {isAuthenticated && (
                      <Link
                        to="/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl px-4 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        My Appointments
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold text-primary"
          >
            {LOGO_MARK}
            Visionary Clinic
          </Link>
        </div>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-muted-foreground sm:flex">
          <Link
            to="/"
            className="rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Home
          </Link>
          {isDoctor ? (
            <>
              <Link
                to="/doctor/schedule"
                className="rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                My Schedule
              </Link>
              <Link
                to="/doctor/consultations"
                className="rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Consultations
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/doctors"
                className="rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Find Doctors
              </Link>
              {isAuthenticated && (
                <Link
                  to="/bookings"
                  className="rounded-full px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  My Appointments
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-full pl-1.5 pr-2.5 ring-2 ring-primary/20 hover:bg-accent hover:ring-primary/20 sm:pr-3"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage
                      src={resolveAssetUrl(user?.avatarUrl)}
                      alt={user?.fullName}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <UserIcon className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-foreground sm:inline">
                    {user?.fullName}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 font-normal">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={resolveAssetUrl(user?.avatarUrl)}
                      alt={user?.fullName}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.fullName}
                    </p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer gap-2 rounded-xl py-2"
                >
                  <Link to="/profile">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setLogoutConfirmOpen(true);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-full" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                className="rounded-full shadow-md shadow-primary/30"
                asChild
              >
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}

          <ConfirmDialog
            open={logoutConfirmOpen}
            onOpenChange={setLogoutConfirmOpen}
            title="Log out?"
            description="You'll need to log in again to book appointments or manage your visits."
            confirmLabel="Log out"
            onConfirm={logout}
          />
        </div>
      </div>
    </header>
  );
}
