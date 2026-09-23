import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_OWNER_USERNAME = "demo-owner";
const DEMO_OWNER_PASSWORD = "demo1234";

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "demo-company" },
    update: {},
    create: {
      id: "demo-company",
      name: "Demo Rentals",
      subscriptionStatus: "ACTIVE",
      trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      // "Up to 20 cars" monthly — matches this demo's 3-car fleet.
      currentPriceId: "price_1UIpngCOsFcz6y3OWXMMnk2l",
    },
  });

  await prisma.user.upsert({
    where: { username: DEMO_OWNER_USERNAME },
    update: {},
    create: {
      companyId: company.id,
      username: DEMO_OWNER_USERNAME,
      passwordHash: await bcrypt.hash(DEMO_OWNER_PASSWORD, 10),
      role: "OWNER",
    },
  });

  const cars = await Promise.all(
    [
      {
        plate: "SK-1234-AB",
        make: "Volkswagen",
        model: "Golf",
        year: 2021,
        registrationExpiryDate: new Date("2027-03-15"),
        transmission: "MANUAL" as const,
        fuelType: "DIESEL" as const,
      },
      {
        plate: "SK-5678-CD",
        make: "Skoda",
        model: "Octavia",
        year: 2022,
        registrationExpiryDate: new Date("2027-08-01"),
        transmission: "AUTOMATIC" as const,
        fuelType: "PETROL" as const,
      },
      {
        plate: "SK-9012-EF",
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        registrationExpiryDate: new Date("2026-12-20"),
        transmission: "AUTOMATIC" as const,
        fuelType: "ELECTRIC" as const,
      },
    ].map((car) =>
      prisma.car.upsert({
        where: { companyId_plate: { companyId: company.id, plate: car.plate } },
        update: {},
        create: { ...car, companyId: company.id },
      }),
    ),
  );

  const clientData = {
    firstName: "Arben",
    lastName: "Krasniqi",
    birthDate: new Date("1990-04-12"),
    passportNumber: "P1234567",
    passportIssueDate: new Date("2022-01-10"),
    passportExpiryDate: new Date("2032-01-10"),
    phone: "+389 70 123 456",
  };
  const client = await prisma.client.upsert({
    where: { id: "demo-client" },
    update: clientData,
    create: { id: "demo-client", companyId: company.id, ...clientData },
  });

  const today = new Date();
  const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  await prisma.contract.deleteMany({ where: { companyId: company.id } });
  for (const data of [
    {
      companyId: company.id,
      carId: cars[0].id,
      startDate: daysFromNow(2),
      endDate: daysFromNow(5),
      dailyPrice: 25,
      totalPrice: 75,
    },
    {
      companyId: company.id,
      carId: cars[1].id,
      startDate: daysFromNow(-3),
      endDate: daysFromNow(1),
      dailyPrice: 30,
      totalPrice: 120,
    },
  ]) {
    await prisma.contract.create({
      data: { ...data, drivers: { create: [{ clientId: client.id, order: 0 }] } },
    });
  }

  console.log(`Seeded company "${company.name}" with ${cars.length} cars.`);
  console.log(`Login: ${DEMO_OWNER_USERNAME} / ${DEMO_OWNER_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
