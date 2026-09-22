import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatDate } from "@/lib/dates";
import { carLabel } from "@/lib/cars";

// The default PDF base fonts (Helvetica etc.) have no Cyrillic glyphs, and
// the contract template's labels are bilingual (English/Macedonian), so a
// font with Cyrillic coverage has to be embedded explicitly.
const fontsDir = path.join(process.cwd(), "src/assets/fonts");
Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(fontsDir, "Roboto-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "Roboto-Bold.ttf"), fontWeight: "bold" },
  ],
});

const border = "#000";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Roboto" },
  outer: { borderWidth: 1, borderColor: border },

  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: border },
  headerLeft: { width: "55%", padding: 10, justifyContent: "center" },
  headerRight: {
    width: "45%",
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: border,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: { fontSize: 14, fontWeight: "bold" },
  titleMk: { fontSize: 11, fontWeight: "bold", textAlign: "center" },
  titleEn: { fontSize: 9, textAlign: "center", marginTop: 2, color: "#333" },
  contractNo: { fontSize: 9, marginTop: 6, textAlign: "center" },

  panelsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: border },
  panel: { width: "50%" },
  panelRight: { borderLeftWidth: 1, borderLeftColor: border },
  sectionHeader: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: border,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 8.5,
  },

  field: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  fieldLast: { flexDirection: "row" },
  fieldLabel: { width: "45%", padding: 5, color: "#333" },
  fieldLabelMk: { fontWeight: "bold", fontSize: 8 },
  fieldLabelEn: { fontSize: 8, color: "#555" },
  fieldValue: {
    width: "55%",
    padding: 5,
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    justifyContent: "center",
  },

  priceRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: border },
  priceCell: { flex: 1, padding: 8, alignItems: "center" },
  priceCellBorder: { borderLeftWidth: 1, borderLeftColor: border },
  priceLabel: { fontSize: 8, color: "#333" },
  priceValue: { fontSize: 12, fontWeight: "bold", marginTop: 3 },

  signRow: { flexDirection: "row" },
  signCell: { width: "50%", padding: 16 },
  signCellBorder: { borderLeftWidth: 1, borderLeftColor: border },
  signLine: { borderTopWidth: 1, borderTopColor: border, marginTop: 30, paddingTop: 4 },
});

function Field({
  labelMk,
  labelEn,
  value,
  last,
}: {
  labelMk: string;
  labelEn: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={last ? styles.fieldLast : styles.field}>
      <View style={styles.fieldLabel}>
        <Text style={styles.fieldLabelMk}>{labelMk}</Text>
        <Text style={styles.fieldLabelEn}>{labelEn}</Text>
      </View>
      <View style={styles.fieldValue}>
        <Text>{value || "-"}</Text>
      </View>
    </View>
  );
}

export interface DriverPdfData {
  firstName: string;
  lastName: string;
  birthDate: Date;
  passportNumber: string | null;
  passportIssueDate: Date | null;
  passportExpiryDate: Date | null;
  licenceNumber: string | null;
  licenceIssueDate: Date | null;
  licenceExpiryDate: Date | null;
  phone: string | null;
}

export interface ContractPdfData {
  id: string;
  createdAt: Date;
  companyName: string;
  drivers: DriverPdfData[];
  car: { make: string; model: string; year: number | null; plate: string };
  startDate: Date;
  endDate: Date;
  days: number;
  dailyPrice: number | null;
  totalPrice: number | null;
}

function formatPrice(value: number | null): string {
  return value != null ? value.toFixed(2) : "-";
}

function formatIdRange(number: string | null, issue: Date | null, expiry: Date | null): string {
  if (!number) return "-";
  const range = issue && expiry ? ` (${formatDate(issue)} – ${formatDate(expiry)})` : "";
  return `${number}${range}`;
}

function DriverBlock({ index, total, driver }: { index: number; total: number; driver: DriverPdfData }) {
  const label = total > 1 ? `Возач ${index + 1} / Driver ${index + 1}` : "Изнајмувач / Renter";
  return (
    <View>
      <Text style={styles.sectionHeader}>{label}</Text>
      <View style={styles.panelsRow}>
        <View style={styles.panel}>
          <Field labelMk="Име и презиме" labelEn="Name" value={`${driver.firstName} ${driver.lastName}`} />
          <Field labelMk="Дата на раѓање" labelEn="Date of birth" value={formatDate(driver.birthDate)} />
          <Field labelMk="Телефон" labelEn="Phone" value={driver.phone ?? ""} last />
        </View>
        <View style={[styles.panel, styles.panelRight]}>
          <Field
            labelMk="Пасош (важи до)"
            labelEn="Passport (valid until)"
            value={formatIdRange(driver.passportNumber, driver.passportIssueDate, driver.passportExpiryDate)}
          />
          <Field
            labelMk="Возачка дозвола (важи до)"
            labelEn="Driving licence (valid until)"
            value={formatIdRange(driver.licenceNumber, driver.licenceIssueDate, driver.licenceExpiryDate)}
            last
          />
        </View>
      </View>
    </View>
  );
}

export function ContractPdf({ data }: { data: ContractPdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outer}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyName}>{data.companyName}</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.titleMk}>ДОГОВОР ЗА ИЗНАЈМУВАЊЕ НА ВОЗИЛО</Text>
              <Text style={styles.titleEn}>RENTAL AGREEMENT</Text>
              <Text style={styles.contractNo}>
                No. {data.id.slice(-8).toUpperCase()} · {formatDate(data.createdAt)}
              </Text>
            </View>
          </View>

          {data.drivers.map((driver, index) => (
            <DriverBlock key={index} index={index} total={data.drivers.length} driver={driver} />
          ))}

          <View>
            <Text style={styles.sectionHeader}>Возило / Vehicle</Text>
            <View style={styles.panelsRow}>
              <View style={styles.panel}>
                <Field
                  labelMk="Тип на кола"
                  labelEn="Car type"
                  value={carLabel(data.car.make, data.car.model, data.car.year)}
                />
                <Field labelMk="Регистрација" labelEn="Licence N°" value={data.car.plate} last />
              </View>
              <View style={[styles.panel, styles.panelRight]}>
                <Field labelMk="Датум на издавање" labelEn="Date of issue" value={formatDate(data.startDate)} />
                <Field labelMk="Датум на прием" labelEn="Date of return" value={formatDate(data.endDate)} last />
              </View>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceCell}>
              <Text style={styles.priceLabel}>Денови / Days</Text>
              <Text style={styles.priceValue}>{data.days}</Text>
            </View>
            <View style={[styles.priceCell, styles.priceCellBorder]}>
              <Text style={styles.priceLabel}>Цена / Daily rate</Text>
              <Text style={styles.priceValue}>{formatPrice(data.dailyPrice)}</Text>
            </View>
            <View style={[styles.priceCell, styles.priceCellBorder]}>
              <Text style={styles.priceLabel}>Вкупно / Total</Text>
              <Text style={styles.priceValue}>{formatPrice(data.totalPrice)}</Text>
            </View>
          </View>

          <View style={styles.signRow}>
            <View style={styles.signCell}>
              <Text style={styles.signLine}>Renter / Изнајмувач</Text>
            </View>
            <View style={[styles.signCell, styles.signCellBorder]}>
              <Text style={styles.signLine}>{data.companyName}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
