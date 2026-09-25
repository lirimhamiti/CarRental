import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { formatDate } from "@/lib/dates";
import { OPTION_LABELS_PDF, formatCountriesForPdf, type ContractOptionKey } from "@/lib/contract-options";

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

const damageDiagramPath = path.join(process.cwd(), "src/assets/images/damage-check-diagram.png");

const border = "#000";

const styles = StyleSheet.create({
  page: { padding: 22, fontSize: 8.5, fontFamily: "Roboto" },
  outer: { borderWidth: 1, borderColor: border },

  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: border },
  headerLeft: { width: "50%", padding: 8, justifyContent: "center" },
  headerRight: {
    width: "50%",
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: border,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: { fontSize: 13, fontWeight: "bold" },
  companyContact: { fontSize: 7, color: "#333", marginTop: 2 },
  titleMk: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  titleEn: { fontSize: 8.5, textAlign: "center", marginTop: 2, color: "#333" },
  contractNo: { fontSize: 8.5, marginTop: 4, textAlign: "center" },

  panelsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: border },
  panel: { width: "50%" },
  panelRight: { borderLeftWidth: 1, borderLeftColor: border },
  sectionHeader: {
    padding: 3,
    borderBottomWidth: 1,
    borderBottomColor: border,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 8,
  },

  field: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  fieldLast: { flexDirection: "row" },
  fieldLabel: { width: "45%", padding: 3, color: "#333" },
  fieldLabelMk: { fontWeight: "bold", fontSize: 7.5 },
  fieldLabelEn: { fontSize: 7.5, color: "#555" },
  fieldValue: {
    width: "55%",
    padding: 3,
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    justifyContent: "center",
  },

  // A dual-column field row where the left and right halves are siblings in
  // the SAME row (rather than two independently stacked columns), so a
  // border always spans a real row and two columns with different field
  // counts never end up with a stray, misaligned half-width line.
  dualRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  dualRowLast: { flexDirection: "row" },
  dualRowBold: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: border },
  dualHalf: { width: "50%", flexDirection: "row" },
  dualHalfRight: { borderLeftWidth: 1, borderLeftColor: border },
  dualHalfRightBold: { borderLeftWidth: 2, borderLeftColor: border },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 22,
    right: 22,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  footerBlock: { width: "35%" },
  footerSpacer: { width: "30%" },
  footerLine: {
    borderTopWidth: 1,
    borderTopColor: border,
    paddingTop: 3,
    textAlign: "center",
    fontSize: 7.5,
  },

  damageRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: border },
  damageCell: { width: "55%", padding: 6, alignItems: "center", justifyContent: "center" },
  damageImage: { width: 210 },
  damageMiddle: { width: "23%", borderLeftWidth: 1, borderLeftColor: border },
  damageRight: { width: "22%", borderLeftWidth: 1, borderLeftColor: border },

  notice: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: border,
    fontSize: 6,
    lineHeight: 1.3,
    color: "#333",
  },
});

const NOTICE_TEXT =
  "IMPORTANT If an accident occurs (a) it must be reported immediately to the company; " +
  "(b) the names and addresses of all persons involved and any witness(es) and the police " +
  "should be obtained and a sketch plan should be made. YOU MUST NOT make any admission " +
  "that you were at fault or liable nor make or promise any payment. I hereby acknowledge " +
  "receipt of the above car in good condition and the following tools supplied with the " +
  "car, for which I accept full responsibility and for which I shall make full payment if " +
  "they are missing on return. SPARE WHEEL, BRACE & JACK.";

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
}

export interface ContractPdfData {
  id: string;
  createdAt: Date;
  companyName: string;
  drivers: DriverPdfData[];
  car: { make: string; model: string; year: number | null; plate: string };
  startDate: Date;
  endDate: Date;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhones: string[];
  crossBorder: boolean;
  gps: boolean;
  babySeat: boolean;
  insurance: boolean;
  validForCountries: string[];
}

function yesOrDash(value: boolean): string {
  return value ? "YES" : "-";
}

function formatDateOrDash(date: Date | null): string {
  return date ? formatDate(date) : "-";
}

interface FieldSpec {
  labelMk: string;
  labelEn: string;
  value: string;
}

function DualFieldHalf({ field }: { field: FieldSpec | null }) {
  if (!field) return <View style={{ width: "100%" }} />;
  return (
    <>
      <View style={styles.fieldLabel}>
        <Text style={styles.fieldLabelMk}>{field.labelMk}</Text>
        <Text style={styles.fieldLabelEn}>{field.labelEn}</Text>
      </View>
      <View style={styles.fieldValue}>
        <Text>{field.value || "-"}</Text>
      </View>
    </>
  );
}

function DualField({
  left,
  right,
  boldBottom,
  boldDivider,
  last,
}: {
  left: FieldSpec | null;
  right: FieldSpec | null;
  boldBottom?: boolean;
  boldDivider?: boolean;
  last?: boolean;
}) {
  const rowStyle = last ? styles.dualRowLast : boldBottom ? styles.dualRowBold : styles.dualRow;
  return (
    <View style={rowStyle}>
      <View style={styles.dualHalf}>
        <DualFieldHalf field={left} />
      </View>
      <View style={[styles.dualHalf, boldDivider ? styles.dualHalfRightBold : styles.dualHalfRight]}>
        <DualFieldHalf field={right} />
      </View>
    </View>
  );
}

function DriverBlock({ index, total, driver }: { index: number; total: number; driver: DriverPdfData }) {
  const label = total > 1 ? `Возач ${index + 1} / Driver ${index + 1}` : "Изнајмувач / Renter";
  const name: FieldSpec = {
    labelMk: "Име и презиме",
    labelEn: "Name",
    value: `${driver.firstName} ${driver.lastName}`.toUpperCase(),
  };
  const birthDate: FieldSpec = { labelMk: "Дата на раѓање", labelEn: "Date of birth", value: formatDate(driver.birthDate) };
  const passportFields: FieldSpec[] = [
    { labelMk: "Пасош N°", labelEn: "Passport N°", value: driver.passportNumber ?? "" },
    { labelMk: "Пасош издаден", labelEn: "Passport issued", value: formatDateOrDash(driver.passportIssueDate) },
    { labelMk: "Пасош важи до", labelEn: "Passport valid until", value: formatDateOrDash(driver.passportExpiryDate) },
  ];
  const licenceFields: FieldSpec[] = [
    { labelMk: "Возачка дозвола N°", labelEn: "Driving licence N°", value: driver.licenceNumber ?? "" },
    { labelMk: "Дозвола издадена", labelEn: "Licence issued", value: formatDateOrDash(driver.licenceIssueDate) },
    { labelMk: "Дозвола важи до", labelEn: "Licence valid until", value: formatDateOrDash(driver.licenceExpiryDate) },
  ];
  return (
    <View>
      <Text style={styles.sectionHeader}>{label}</Text>
      <DualField left={name} right={birthDate} boldBottom />
      {passportFields.map((passportField, i) => (
        <DualField
          key={i}
          left={passportField}
          right={licenceFields[i]}
          boldDivider
          last={i === passportFields.length - 1}
        />
      ))}
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
              {data.companyAddress && <Text style={styles.companyContact}>{data.companyAddress}</Text>}
              {data.companyEmail && <Text style={styles.companyContact}>{data.companyEmail}</Text>}
              {data.companyPhones.length > 0 && (
                <Text style={styles.companyContact}>{data.companyPhones.join(" · ")}</Text>
              )}
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
                  value={`${data.car.make} ${data.car.model}`}
                />
                <Field labelMk="Регистрација" labelEn="Licence N°" value={data.car.plate} last />
              </View>
              <View style={[styles.panel, styles.panelRight]}>
                <Field
                  labelMk="Датум на издавање"
                  labelEn="Date of issue"
                  value={`${formatDate(data.startDate)} · 11:00`}
                />
                <Field
                  labelMk="Место и датум на прием"
                  labelEn="Place and date of return"
                  value={`${formatDate(data.endDate)} · 21:00`}
                  last
                />
              </View>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Проверка на возилото / Damage check form</Text>
          <View style={styles.damageRow}>
            <View style={styles.damageCell}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF
                  drawing primitive, not an HTML img; it has no alt prop. */}
              <Image src={damageDiagramPath} style={styles.damageImage} />
            </View>
            <View style={styles.damageMiddle}>
              {(Object.keys(OPTION_LABELS_PDF) as ContractOptionKey[]).map((key) => (
                <Field key={key} labelMk={OPTION_LABELS_PDF[key].mk} labelEn={OPTION_LABELS_PDF[key].en} value={yesOrDash(data[key])} />
              ))}
              <Field
                labelMk="Важи за"
                labelEn="Valid for"
                value={formatCountriesForPdf(data.validForCountries)}
                last
              />
            </View>
            <View style={styles.damageRight}>
              <Field labelMk="Неограничена км" labelEn="Unlimited km" value="" />
              <Field labelMk="Километри (излез)" labelEn="Kilometri (out)" value="" />
              <Field labelMk="Километри (влез)" labelEn="Kilometri (in)" value="" />
              <Field labelMk="18% ДДВ" labelEn="18% VAT" value="" />
              <Field labelMk="Гориво" labelEn="Gasoline" value="" last />
            </View>
          </View>

          <Text style={styles.notice}>{NOTICE_TEXT}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBlock}>
            <Text style={styles.footerLine}>Computed by / Изготвил</Text>
          </View>
          <View style={styles.footerSpacer} />
          <View style={styles.footerBlock}>
            <Text style={styles.footerLine}>Renter / Изнајмувач</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
