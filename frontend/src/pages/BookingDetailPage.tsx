import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";

import { getErrorMessage, resolveAssetUrl } from "@/api/client";
import { cancelBooking, getBooking } from "@/api/bookings";
import { processPayment } from "@/api/payments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState } from "@/components/ErrorState";
import { Form } from "@/components/ui/form";
import { Loading } from "@/components/Loading";
import {
  BOOKING_STATUS_VARIANT,
  formatCurrency,
  formatFullDate,
} from "@/lib/utils";
import { Stethoscope } from "lucide-react";

const paymentSchema = z.object({
  amount: z.number().positive("Enter an amount greater than zero"),
  paymentType: z.enum([
    "CASH",
    "CARD",
    "KBZ_PAY",
    "WAVE_MONEY",
    "BANK_TRANSFER",
    "INSURANCE",
  ]),
});
type PaymentValues = z.infer<typeof paymentSchema>;

export function BookingDetailPage() {
  const { id } = useParams();
  const bookingId = Number(id);
  const [cancelOpen, setCancelOpen] = useState(false);

  const {
    data: booking,
    error,
    isLoading,
    mutate,
  } = useSWR(Number.isFinite(bookingId) ? ["booking", bookingId] : null, () =>
    getBooking(bookingId),
  );

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    values: booking
      ? { amount: booking.leftAmount, paymentType: "CASH" }
      : undefined,
  });

  async function onPay(values: PaymentValues) {
    if (!booking) return;
    try {
      const updated = await processPayment(booking.id, values);
      await mutate(updated);
      toast.success(
        updated.leftAmount <= 0
          ? "Payment complete - appointment confirmed!"
          : "Payment recorded.",
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function onCancel() {
    if (!booking) return;
    try {
      const updated = await cancelBooking(booking.id);
      await mutate(updated);
      toast.success("Appointment cancelled.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (isLoading) {
    return <Loading label="Loading appointment..." />;
  }

  if (error || !booking) {
    return (
      <ErrorState
        message="Couldn't load this appointment."
        onRetry={() => mutate()}
      />
    );
  }

  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const canPay =
    booking.leftAmount > 0 &&
    booking.status !== "CANCELLED" &&
    booking.status !== "COMPLETED";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
              <AvatarImage
                src={resolveAssetUrl(booking.doctor.user.avatarUrl)}
                alt={booking.doctor.user.fullName}
              />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <Stethoscope className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{booking.doctor.user.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {booking.doctor.specialization}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFullDate(booking.appointmentDate)}
              </p>
            </div>
          </div>
          <Badge
            variant={BOOKING_STATUS_VARIANT[booking.status]}
            className="rounded-full"
          >
            {booking.status}
          </Badge>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Billing summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Consultation fee</span>
            <span>{formatCurrency(booking.consultationFee)}</span>
          </div>
          {booking.insuranceDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Insurance discount{" "}
                {booking.provider ? `(${booking.provider.name})` : ""}
              </span>
              <span>- {formatCurrency(booking.insuranceDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid so far</span>
            <span>{formatCurrency(booking.depositAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-medium">
            <span>Balance due</span>
            <span>{formatCurrency(booking.leftAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {canPay && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Make a payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPay)} className="space-y-4">
                {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (MMK)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className="rounded-xl"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment method</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}

                <Button
                  type="submit"
                  className="w-full rounded-full shadow-md shadow-primary/30"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Processing..." : "Pay now"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {booking.payments.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Payment history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.paymentType.replace("_", " ")} ·{" "}
                    {payment.transactionReference}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {payment.paymentStatus}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {canCancel && (
        <Button
          variant="outline"
          className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setCancelOpen(true)}
        >
          Cancel appointment
        </Button>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this appointment?"
        description="This will free up the slot for other patients. This can't be undone."
        confirmLabel="Cancel appointment"
        destructive
        onConfirm={onCancel}
      />
    </div>
  );
}
