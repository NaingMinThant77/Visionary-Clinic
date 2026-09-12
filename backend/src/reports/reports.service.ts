import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Computed on the fly from Booking + Expense rows for the given date range
   * (inclusive) - see the OPDProfitLossReport model comment in schema.prisma.
   * There is no patientId here: this is a period rollup, not a per-patient
   * report.
   *
   * Revenue = consultation fees + insurance claims: a booking's
   * consultationFee is split between what the patient pays out of pocket and
   * what's claimed back from the insurance provider (insuranceDiscount), so
   * the full consultationFee - not just what the patient personally paid -
   * is the clinic's OPD revenue for that visit. Both this and the expense
   * side are filtered by a single date dimension per entity: a booking's
   * appointmentDate (the OPD visit), an expense's expenseDate.
   */
  async getOpdProfitLoss(fromStr: string, toStr: string) {
    const from = new Date(fromStr);
    const toExclusive = new Date(new Date(toStr).getTime() + 24 * 60 * 60 * 1000);

    const [bookingAgg, expenseAgg] = await Promise.all([
      this.prisma.booking.aggregate({
        _sum: { consultationFee: true, insuranceDiscount: true },
        where: { appointmentDate: { gte: from, lt: toExclusive } },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { expenseDate: { gte: from, lt: toExclusive } },
      }),
    ]);

    const totalConsultationFees = bookingAgg._sum.consultationFee?.toNumber() ?? 0;
    const totalInsuranceDiscount = bookingAgg._sum.insuranceDiscount?.toNumber() ?? 0;
    const totalOPDRevenue = totalConsultationFees;
    const totalExpenses = expenseAgg._sum.amount?.toNumber() ?? 0;
    const netProfit = totalOPDRevenue - totalExpenses;

    return {
      reportDateFrom: from.toISOString(),
      reportDateTo: new Date(toExclusive.getTime() - 1).toISOString(),
      totalOPDRevenue,
      totalConsultationFees,
      totalInsuranceDiscount,
      totalExpenses,
      netProfit,
    };
  }
}
