import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isRealConflict, nightsBetween, parseDateOnly } from "@/lib/availability";
import { isDriverValid, type DriverIdentity } from "@/lib/driver-validation";
import { ALL_COUNTRIES, VALID_FOR_COUNTRY_KEYS } from "@/lib/contract-options";
import { formatContractNumber } from "@/lib/contract-number";

export interface DriverBody extends DriverIdentity {
  clientId?: string;
}

export interface ContractBody {
  drivers: DriverBody[];
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  crossBorder?: boolean;
  gps?: boolean;
  babySeat?: boolean;
  insurance?: boolean;
  outOfHours?: boolean;
  validForCountries?: string[];
}

const VALID_COUNTRY_CODES = new Set<string>([ALL_COUNTRIES, ...VALID_FOR_COUNTRY_KEYS]);

export function isContractBodyValid(body: ContractBody): boolean {
  return (
    Array.isArray(body.drivers) &&
    body.drivers.length > 0 &&
    body.drivers.every(isDriverValid) &&
    Boolean(body.carId) &&
    Boolean(body.startDate) &&
    Boolean(body.endDate)
  );
}

export type ContractWriteError = "END_BEFORE_START" | "CAR_NOT_FOUND" | "CLIENT_NOT_FOUND" | "CAR_UNAVAILABLE";

export interface PreparedContractWrite {
  startDate: Date;
  endDate: Date;
  dailyPrice: number | null;
  totalPrice: number | null;
  validForCountries: string[];
  carId: string;
  clientIds: string[];
}

// Shared by both creating a new contract and editing an existing one. When
// editing, `excludeContractId` leaves the contract's own current booking out
// of the overlap check — otherwise saving a change (e.g. just the price)
// without touching the dates would always fail as "unavailable" against
// itself.
export async function prepareContractWrite(
  body: ContractBody,
  companyId: string,
  excludeContractId?: string,
): Promise<{ error: ContractWriteError } | PreparedContractWrite> {
  const startDate = parseDateOnly(body.startDate);
  const endDate = parseDateOnly(body.endDate);
  if (endDate <= startDate) {
    return { error: "END_BEFORE_START" };
  }
  const days = nightsBetween(startDate, endDate);
  const totalPrice = body.totalPrice != null && Number(body.totalPrice) > 0 ? Number(body.totalPrice) : null;
  const dailyPrice = totalPrice != null ? Math.round((totalPrice / days) * 100) / 100 : null;
  const validForCountries = Array.isArray(body.validForCountries)
    ? body.validForCountries.filter((c) => VALID_COUNTRY_CODES.has(c))
    : [];

  const car = await prisma.car.findFirst({ where: { id: body.carId, companyId } });
  if (!car) {
    return { error: "CAR_NOT_FOUND" };
  }

  const overlapping = await prisma.contract.findMany({
    where: {
      carId: car.id,
      status: "ACTIVE",
      startDate: { lt: endDate },
      endDate: { gt: startDate },
      ...(excludeContractId ? { id: { not: excludeContractId } } : {}),
    },
  });
  if (overlapping.some((c) => isRealConflict(c.startDate, c.endDate, startDate, endDate))) {
    return { error: "CAR_UNAVAILABLE" };
  }

  const driverData = (d: DriverBody) => ({
    firstName: d.firstName.trim(),
    lastName: d.lastName.trim(),
    birthDate: parseDateOnly(d.birthDate),
    passportNumber: d.passportNumber?.trim() || null,
    passportIssueDate: d.passportIssueDate ? parseDateOnly(d.passportIssueDate) : null,
    passportExpiryDate: d.passportExpiryDate ? parseDateOnly(d.passportExpiryDate) : null,
    licenceNumber: d.licenceNumber?.trim() || null,
    licenceIssueDate: d.licenceIssueDate ? parseDateOnly(d.licenceIssueDate) : null,
    licenceExpiryDate: d.licenceExpiryDate ? parseDateOnly(d.licenceExpiryDate) : null,
  });

  const clientIds: string[] = [];
  for (const d of body.drivers) {
    if (d.clientId) {
      const existing = await prisma.client.findFirst({ where: { id: d.clientId, companyId } });
      if (!existing) {
        return { error: "CLIENT_NOT_FOUND" };
      }
      await prisma.client.update({ where: { id: d.clientId }, data: driverData(d) });
      clientIds.push(d.clientId);
    } else {
      const created = await prisma.client.create({ data: { companyId, ...driverData(d) } });
      clientIds.push(created.id);
    }
  }

  return { startDate, endDate, dailyPrice, totalPrice, validForCountries, carId: car.id, clientIds };
}

export function contractWriteErrorStatus(error: ContractWriteError): number {
  if (error === "END_BEFORE_START") return 400;
  if (error === "CAR_UNAVAILABLE") return 409;
  return 404;
}

function isNumberConflict(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    Array.isArray((err.meta as { target?: unknown } | undefined)?.target) &&
    (err.meta as { target: string[] }).target.includes("number")
  );
}

// Creates a brand-new contract with a freshly assigned number (ddMMyy + a
// 2-digit per-company daily sequence). The sequence is derived from a count
// query rather than a stored counter, so two contracts created for the same
// company in the same instant could race for the same number — the unique
// constraint on (companyId, number) catches that, and this retries with a
// recomputed count rather than surfacing it as a user-facing error.
export async function createContractWithNumber(
  companyId: string,
  prepared: PreparedContractWrite,
  body: ContractBody,
): Promise<{ id: string } | { error: "CAR_UNAVAILABLE" }> {
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const countToday = await prisma.contract.count({
      where: { companyId, createdAt: { gte: dayStart, lt: dayEnd } },
    });
    const number = formatContractNumber(now, countToday + 1);
    try {
      const contract = await prisma.contract.create({
        data: {
          companyId,
          number,
          carId: prepared.carId,
          startDate: prepared.startDate,
          endDate: prepared.endDate,
          dailyPrice: prepared.dailyPrice,
          totalPrice: prepared.totalPrice,
          crossBorder: body.crossBorder ?? true,
          gps: body.gps ?? false,
          babySeat: body.babySeat ?? false,
          insurance: body.insurance ?? false,
          outOfHours: body.outOfHours ?? false,
          validForCountries: prepared.validForCountries,
          drivers: {
            create: prepared.clientIds.map((clientId, order) => ({ clientId, order })),
          },
        },
      });
      return { id: contract.id };
    } catch (err) {
      if (isNumberConflict(err) && attempt < MAX_ATTEMPTS - 1) continue;
      // Either the DB exclusion constraint rejected the car/date overlap (a
      // race the app-level check above can't fully close), or we've
      // exhausted retries on a colliding contract number.
      return { error: "CAR_UNAVAILABLE" };
    }
  }
  return { error: "CAR_UNAVAILABLE" };
}
