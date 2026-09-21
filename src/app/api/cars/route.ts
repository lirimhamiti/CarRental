import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";

interface CreateCarBody {
  make: string;
  model: string;
  year: number;
  plate: string;
  status?: "ACTIVE" | "MAINTENANCE" | "RETIRED";
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateCarBody;

  if (
    !body.make?.trim() ||
    !body.model?.trim() ||
    !body.plate?.trim() ||
    !Number.isInteger(body.year) ||
    body.year < 1900
  ) {
    return NextResponse.json({ code: "MISSING_FIELDS" }, { status: 400 });
  }

  const companyId = await getCurrentCompanyId();

  try {
    const car = await prisma.car.create({
      data: {
        companyId,
        make: body.make.trim(),
        model: body.model.trim(),
        year: body.year,
        plate: body.plate.trim().toUpperCase(),
        status: body.status ?? "ACTIVE",
      },
    });
    return NextResponse.json(car, { status: 201 });
  } catch {
    return NextResponse.json({ code: "PLATE_EXISTS" }, { status: 409 });
  }
}
