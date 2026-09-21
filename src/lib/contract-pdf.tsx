import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatDate } from "@/lib/dates";

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
  panelTitle: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: border,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
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

export interface ContractPdfData {
  id: string;
  createdAt: Date;
  companyName: string;
  client: {
    firstName: string;
    lastName: string;
    documentNumber: string;
    email: string | null;
    phone: string | null;
  };
  car: { make: string; model: string; year: number; plate: string };
  startDate: Date;
  endDate: Date;
  days: number;
  dailyPrice: number;
  totalPrice: number;
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

          <View style={styles.panelsRow}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Renter / Изнајмувач</Text>
              <Field labelMk="Име и презиме" labelEn="Name" value={`${data.client.firstName} ${data.client.lastName}`} />
              <Field labelMk="Пасош №/ID" labelEn="Passport N° / ID" value={data.client.documentNumber} />
              <Field labelMk="Е-пошта" labelEn="Email" value={data.client.email ?? ""} />
              <Field labelMk="Телефон" labelEn="Telephone" value={data.client.phone ?? ""} last />
            </View>
            <View style={[styles.panel, styles.panelRight]}>
              <Text style={styles.panelTitle}>Vehicle / Возило</Text>
              <Field
                labelMk="Тип на кола"
                labelEn="Car type"
                value={`${data.car.make} ${data.car.model} (${data.car.year})`}
              />
              <Field labelMk="Регистрација" labelEn="Licence N°" value={data.car.plate} />
              <Field labelMk="Датум на издавање" labelEn="Date of issue" value={formatDate(data.startDate)} />
              <Field labelMk="Место и датум на прием" labelEn="Date of return" value={formatDate(data.endDate)} last />
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceCell}>
              <Text style={styles.priceLabel}>Денови / Days</Text>
              <Text style={styles.priceValue}>{data.days}</Text>
            </View>
            <View style={[styles.priceCell, styles.priceCellBorder]}>
              <Text style={styles.priceLabel}>Цена / Daily rate</Text>
              <Text style={styles.priceValue}>{data.dailyPrice.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceCell, styles.priceCellBorder]}>
              <Text style={styles.priceLabel}>Вкупно / Total</Text>
              <Text style={styles.priceValue}>{data.totalPrice.toFixed(2)}</Text>
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
