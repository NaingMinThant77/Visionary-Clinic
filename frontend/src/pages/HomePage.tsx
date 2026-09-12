import { CalendarCheck, CreditCard, Search, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const PATIENT_STEPS = [
  {
    icon: Search,
    title: "Find a doctor",
    description:
      "Search by name, specialization, or department to find the right doctor for you.",
    url: "/doctors",
  },
  {
    icon: CalendarCheck,
    title: "Book an appointment",
    description:
      "Pick an open slot and share your details - no phone calls or waiting rooms.",
    url: "/bookings",
  },
  {
    icon: CreditCard,
    title: "Pay online",
    description:
      "Settle consultation fees securely, with insurance discounts applied automatically.",
    url: "/bookings",
  },
];

const DOCTOR_STEPS = [
  {
    icon: CalendarCheck,
    title: "My schedule",
    description: "Manage the weekly slots patients can book with you.",
    url: "/doctor/schedule",
  },
  {
    icon: Search,
    title: "Consultations",
    description:
      "View patients booked into your schedule and record consultation notes.",
    url: "/doctor/consultations",
  },
];

const ADMIN_STEPS = [
  {
    icon: Search,
    title: "Doctors",
    description: "Configure doctor profiles and manage their availability.",
    url: "/admin/doctors",
  },
  {
    icon: CalendarCheck,
    title: "Daily bookings",
    description: "Oversee appointments and patient check-ins for the day.",
    url: "/admin/bookings",
  },
  {
    icon: CreditCard,
    title: "Financial reports",
    description: "Track OPD revenue, expenses, and net profit.",
    url: "/admin/reports",
  },
];

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const steps =
    user?.role === "ADMIN"
      ? ADMIN_STEPS
      : user?.role === "DOCTOR"
        ? DOCTOR_STEPS
        : PATIENT_STEPS;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 py-4">
      <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-accent blur-3xl" />

        <div className="relative p-8 text-center sm:p-14">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <Stethoscope className="h-7 w-7" />
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-900 dark:text-slate-200 sm:text-5xl">
            <span className="block">Healthcare, booked</span>
            <span className="bg-gradient-to-r from-indigo-400 to-pink-600 bg-clip-text text-transparent">
              on your schedule
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500 dark:text-slate-400">
            Visionary Clinic makes it easy to search doctors, book appointments,
            and pay consultation fees online - all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!isAuthenticated && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link to="/register">Create an account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <Link key={step.title} to={step.url}>
            <Card className="h-full rounded-2xl transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
