import { Prisma } from '@prisma/client';

/**
 * ClassSerializerInterceptor (class-transformer) copies Decimal.js instances
 * as their raw internal fields ({ s, e, d }) instead of calling toJSON(), so
 * any response containing a Prisma Decimal must be run through this first.
 */
export function toPlainDecimals<T>(value: T): T {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => toPlainDecimals(item)) as unknown as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toPlainDecimals(val);
    }
    return result as T;
  }
  return value;
}
