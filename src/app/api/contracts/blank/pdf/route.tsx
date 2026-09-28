import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentCompanyId } from "@/lib/company";
import { ContractPdf, type DriverPdfData } from "@/lib/contract-pdf";

// A blank driver block — every field left empty/dash so the printed form can
// be filled in by hand.
const blankDriver: DriverPdfData = {
  firstName: "",
  lastName: "",
  birthDate: null,
  passportNumber: null,
  passportIssueDate: null,
  passportExpiryDate: null,
  licenceNumber: null,
  licenceIssueDate: null,
  licenceExpiryDate: null,
};

export async function GET() {
  const companyId = await getCurrentCompanyId();
  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });

  const buffer = await renderToBuffer(
    <ContractPdf
      data={{
        id: "blank",
        createdAt: new Date(),
        companyName: company.name,
        companyAddress: company.address,
        companyEmail: company.email,
        companyPhones: company.phones,
        drivers: [blankDriver, blankDriver],
        car: { make: "", model: "", year: null, plate: "" },
        startDate: null,
        endDate: null,
        crossBorder: false,
        gps: false,
        babySeat: false,
        insurance: false,
        outOfHours: false,
        validForCountries: [],
      }}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contract-blank.pdf"`,
    },
  });
}
