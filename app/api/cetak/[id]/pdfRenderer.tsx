import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 12 },
  headerText: { textAlign: 'center', fontSize: 14, fontFamily: 'Times-Bold' },
  line: { borderBottomWidth: 2, borderBottomColor: '#000', marginVertical: 15 },
  subheader: { textAlign: 'center', fontSize: 12, textDecoration: 'underline', fontFamily: 'Times-Bold', marginBottom: 5 },
  resi: { textAlign: 'center', marginBottom: 30 },
  infoLabel: { width: 120 },
  infoValue: { flex: 1 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  table: { display: 'flex', flexDirection: 'column', marginBottom: 40, marginTop: 10, paddingHorizontal: 20 },
  tableHeaderRow: { flexDirection: 'row', marginBottom: 15, fontFamily: 'Times-Bold' },
  tableDataRow: { flexDirection: 'row', marginBottom: 10 },
  colName: { flex: 1 },
  colCode: { flex: 2, textAlign: 'left', fontSize: 10 },
  colQty: { width: 80, textAlign: 'center' },
  signatureContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 30 },
  signatureBlock: { width: 150, textAlign: 'center' },
  signatureName: { marginTop: 80 }
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

const SuratPDF = ({ pengajuan, peminjam, itemsList }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.headerText}>LABORATORIUM TKJ</Text>
      <Text style={styles.headerText}>UNIT PENGELOLA JARINGAN (UPJ)</Text>
      <View style={styles.line} />
      <Text style={styles.subheader}>SURAT PEMINJAMAN BARANG</Text>
      <Text style={styles.resi}>No: {pengajuan.kode_resi}</Text>

      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Peminjam</Text>
          <Text style={styles.infoValue}>:  {peminjam.nama}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kelas</Text>
          <Text style={styles.infoValue}>:  {peminjam.kelas ? peminjam.kelas + ' - ' : ''}{peminjam.nomor_induk}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tanggal Pinjam</Text>
          <Text style={styles.infoValue}>:  {formatDate(pengajuan.tanggal_pinjam)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tanggal Kembali</Text>
          <Text style={styles.infoValue}>:  {pengajuan.tanggal_kembali ? formatDate(pengajuan.tanggal_kembali) : '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Keperluan</Text>
          <Text style={styles.infoValue}>:  {pengajuan.catatan || '-'}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.colName}>Nama Barang</Text>
          <Text style={styles.colCode}>Kode</Text>
          <Text style={styles.colQty}>Jumlah</Text>
        </View>
        {itemsList.map((item: any, i: number) => (
          <View style={styles.tableDataRow} key={i}>
            <Text style={styles.colName}>{item.name}</Text>
            <Text style={styles.colCode}>{item.code}</Text>
            <Text style={styles.colQty}>{item.qty}</Text>
          </View>
        ))}
      </View>

      <View style={styles.signatureContainer}>
        <View style={styles.signatureBlock}>
          <Text>Peminjam</Text>
          <Text style={styles.signatureName}>({peminjam.nama})</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text>Petugas Lab</Text>
          <Text style={styles.signatureName}>(...............................................)</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const generatePdfStream = async (pengajuan: any, peminjam: any, itemsList: any[]) => {
  return await renderToStream(<SuratPDF pengajuan={pengajuan} peminjam={peminjam} itemsList={itemsList} />);
};
