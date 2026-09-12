import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";

import { getErrorMessage } from "@/api/client";
import {
  createSchedule,
  deleteSchedule,
  getMySchedules,
  updateSchedule,
  type UpsertSchedulePayload,
} from "@/api/doctorPortal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DAY_LABELS, formatCurrency } from "@/lib/utils";
import type { DoctorSchedule } from "@/types";

const DAY_OPTIONS = Object.entries(DAY_LABELS) as [
  keyof typeof DAY_LABELS,
  string,
][];

const scheduleSchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h) format"),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h) format"),
    maximumPatientSession: z.number().int().min(1, "Must be at least 1"),
    consultationFees: z.number().positive("Enter a fee greater than zero"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["endTime"],
  });
type ScheduleValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: DoctorSchedule | null;
  onSaved: () => void;
}

function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  onSaved,
}: ScheduleFormDialogProps) {
  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    values: schedule
      ? {
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          maximumPatientSession: schedule.maximumPatientSession,
          consultationFees: schedule.consultationFees,
        }
      : {
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "12:00",
          maximumPatientSession: 10,
          consultationFees: 0,
        },
  });

  async function onSubmit(values: ScheduleValues) {
    const payload: UpsertSchedulePayload = values;
    try {
      if (schedule) {
        await updateSchedule(schedule.id, payload);
        toast.success("Schedule updated.");
      } else {
        await createSchedule(payload);
        toast.success("Schedule added.");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {schedule ? "Edit schedule" : "Add schedule"}
          </DialogTitle>
          <DialogDescription>
            Set the day, hours, capacity, and fee for this slot.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of week</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAY_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type="time" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input type="time" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maximumPatientSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max patients/day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-xl"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consultationFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee (MMK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="rounded-xl"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="rounded-full shadow-md shadow-primary/30"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : schedule
                    ? "Save changes"
                    : "Add schedule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DoctorSchedulePage() {
  const {
    data: schedules,
    error,
    isLoading,
    mutate,
  } = useSWR("my-schedules", getMySchedules);
  console.log("Schedule:", schedules);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorSchedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DoctorSchedule | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(schedule: DoctorSchedule) {
    setEditing(schedule);
    setFormOpen(true);
  }

  async function toggleActive(schedule: DoctorSchedule) {
    try {
      await updateSchedule(schedule.id, { isActive: !schedule.isActive });
      mutate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSchedule(deleteTarget.id);
      toast.success("Schedule removed.");
      mutate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My availability</h1>
          <p className="text-sm text-muted-foreground">
            Manage the weekly slots patients can book.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-full shadow-md shadow-primary/30"
        >
          <Plus className="h-4 w-4" /> Add schedule
        </Button>
      </div>

      {isLoading && <Loading label="Loading your schedule..." />}

      {error && (
        <ErrorState
          message="Couldn't load your schedule."
          onRetry={() => mutate()}
        />
      )}

      {!isLoading && !error && schedules?.length === 0 && (
        <EmptyState
          title="No availability yet"
          description="Add a weekly slot so patients can book you."
          action={
            <Button onClick={openCreate} className="rounded-full">
              Add schedule
            </Button>
          }
        />
      )}

      {!isLoading && !error && schedules && schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">
                    {DAY_LABELS[schedule.dayOfWeek]} · {schedule.startTime} –{" "}
                    {schedule.endTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(schedule.consultationFees)} · up to{" "}
                    {schedule.maximumPatientSession} patients/day
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleActive(schedule)}
                    />
                    {schedule.isActive ? "Active" : "Inactive"}
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => openEdit(schedule)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(schedule)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schedule={editing}
        onSaved={() => mutate()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this schedule?"
        description="Patients will no longer be able to book this slot. Existing bookings aren't affected."
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
