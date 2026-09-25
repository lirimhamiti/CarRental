import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { nightsBetween, parseDateOnly } from "@/lib/availability";
import { isDriverValid, type DriverIdentity } from "@/lib/driver-validation";
import { ALL_COUNTRIES, VALID_FOR_COUNTRY_KEYS } from "@/lib/contract-options";

interface DriverBody extends DriverIdentity {
  clientId?: string;
}

interface CreateContractBody {
  drivers: DriverBody[];
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  crossBorder?: boolean;
  gps?: boolean;
  babySeat?: boolean;
  insurance?: boolean;
  validForCountries?: string[];
}

const VALID_COUNTRY_CODES = new Set<string>([ALL_COUNTRIES, ...VALID_FOR_COUNTRY_KEYS]);

export async function POST(request: Request) {
  const body = (await request.json()) as CreateContractBody;

  if (
    !Array.isArray(body.drivers) ||
    body.drivers.length === 0 ||
    !body.drivers.every(isDriverValid) ||
    !body.carId ||
    !body.startDate ||
    !body.endDate
  ) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  try {
    const companyId = await getCurrentCompanyId();
    const startDate = parseDateOnly(body.startDate);
    const endDate = parseDateOnly(body.endDate);
    if (endDate <= startDate) {
      return NextResponse.json({ code: "END_BEFORE_START" }, { status: 400 });
    }
    const days = nightsBetween(startDate, endDate);
    const totalPrice = body.totalPrice != null && Number(body.totalPrice) > 0 ? Number(body.totalPrice) : null;
    const dailyPrice = totalPrice != null ? Math.round((totalPrice / days) * 100) / 100 : null;
    const validForCountries = Array.isArray(body.validForCountries)
      ? body.validForCountries.filter((c) => VALID_COUNTRY_CODES.has(c))
      : [];

    const car = await prisma.car.findFirst({ where: { id: body.carId, companyId } });
    if (!car) {
      return NextResponse.json({ code: "CAR_NOT_FOUND" }, { status: 404 });
    }

    const overlapping = await prisma.contract.findFirst({
      where: {
        carId: car.id,
        status: "ACTIVE",
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
    if (overlapping) {
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
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
          return NextResponse.json({ code: "CLIENT_NOT_FOUND" }, { status: 404 });
        }
        await prisma.client.update({ where: { id: d.clientId }, data: driverData(d) });
        clientIds.push(d.clientId);
      } else {
        const created = await prisma.client.create({ data: { companyId, ...driverData(d) } });
        clientIds.push(created.id);
      }
    }

    try {
      const contract = await prisma.contract.create({
        data: {
          companyId,
          carId: car.id,
          startDate,
          endDate,
          dailyPrice,
          totalPrice,
          crossBorder: body.crossBorder ?? true,
          gps: body.gps ?? false,
          babySeat: body.babySeat ?? false,
          insurance: body.insurance ?? false,
          validForCountries,
          drivers: {
            create: clientIds.map((clientId, order) => ({ clientId, order })),
          },
        },
      });
      return NextResponse.json({ id: contract.id });
    } catch {
      // Guards the race condition the app-level check above can't fully close;
      // the DB exclusion constraint (see migration car_no_overlap) rejects it.
      return NextResponse.json({ code: "CAR_UNAVAILABLE" }, { status: 409 });
    }
  } catch (err) {
    // Any unexpected failure (e.g. a DB schema out of sync with a pending
    // migration) must still return JSON — an uncaught throw here leaves the
    // client with an empty response body and a confusing JSON-parse crash.
    console.error("POST /api/contracts failed:", err);
    return NextResponse.json({ code: "GENERIC" }, { status: 500 });
  }
}
