import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatDate } from "@/lib/dates";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 120, color: "#555" },
  value: { flex: 1 },
  signatures: { flexDirection: "row", marginTop: 60, justifyContent: "space-between" },
  signatureBlock: { width: "40%" },
  signatureLine: { borderTopWidth: 1, borderTopColor: "#000", marginTop: 40, paddingTop: 4 },
});

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
        <Text style={styles.title}>Rental Agreement</Text>
        <Text style={styles.subtitle}>
          {data.companyName} · Contract #{data.id.slice(-8).toUpperCase()} ·{" "}
          {formatDate(data.createdAt)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Renter</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>
              {data.client.firstName} {data.client.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ID / Passport No.</Text>
            <Text style={styles.value}>{data.client.documentNumber}</Text>
          </View>
          {data.client.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{data.client.email}</Text>
            </View>
          )}
          {data.client.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{data.client.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Car</Text>
            <Text style={styles.value}>
              {data.car.make} {data.car.model} ({data.car.year})
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Plate</Text>
            <Text style={styles.value}>{data.car.plate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental period</Text>
          <View style={styles.row}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{formatDate(data.startDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{formatDate(data.endDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Days</Text>
            <Text style={styles.value}>{data.days}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Daily rate</Text>
            <Text style={styles.value}>{data.dailyPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{data.totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLine}>Renter signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLine}>{data.companyName} signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
