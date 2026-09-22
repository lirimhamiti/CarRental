import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const company = await prisma.company.upsert({
    where: { id: "demo-company" },
    update: {},
    create: {
      id: "demo-company",
      name: "Demo Rentals",
      subscriptionStatus: "ACTIVE",
    },
  });

  const cars = await Promise.all(
    [
      { plate: "SK-1234-AB", make: "Volkswagen", model: "Golf", year: 2021 },
      { plate: "SK-5678-CD", make: "Skoda", model: "Octavia", year: 2022 },
      { plate: "SK-9012-EF", make: "Toyota", model: "Corolla", year: 2020 },
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
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
