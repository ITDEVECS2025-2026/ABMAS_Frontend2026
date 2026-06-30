import React, { useState } from 'react';
import ScreenHeader from "@/components/ui/ScreenHeader";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSensorStore } from '@/store/sensorContext';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants';
import GaugeCard from '@/components/device/GaugeCard';
import ParameterCard from '@/components/device/ParameterCard';
import SectionHeader from '@/components/ui/SectionHeader';
import FertilizerForm from '@/components/form/FertilizerFrom';
import { getCurrentLocation, formatCoordinates, getTimeAgo } from '@/utils/gps';
import { FertilizerInput, FertilizationRecord } from '../../../interfaces';

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSensorById, updateSensorLocation, addFertilizationRecord } = useSensorStore();

  const sensor = getSensorById(id);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);

  if (!sensor) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Sensor" />
        <Text style={{ color: COLORS.text, textAlign: 'center', marginTop: 40 }}>
          Sensor tidak ditemukan
        </Text>
      </SafeAreaView>
    );
  }

  const handleGetGPS = async () => {
    setLoadingGPS(true);
    const location = await getCurrentLocation();
    setLoadingGPS(false);
    if (location) {
      updateSensorLocation(sensor.id, location);
      Alert.alert('GPS Berhasil', `Koordinat: ${formatCoordinates(location)}\nAkurasi: ${location.accuracy?.toFixed(1)} m`);
    } else {
      Alert.alert('GPS Gagal', 'Tidak dapat mendapatkan lokasi. Periksa izin GPS.');
    }
  };

  const handleFertilizerSubmit = (data: FertilizerInput) => {
    addFertilizationRecord(sensor.id, data);
    setShowForm(false);
    Alert.alert('Berhasil', 'Data pemupukan telah disimpan');
  };

  // Format timestamp dari backend (unix seconds)
  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  // Status code mapping
  const getStatusLabel = (st?: number) => {
    switch (st) {
      case 1: return 'Online';
      case 2: return 'Idle';
      case 3: return 'Warning';
      case 4: return 'Error';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (st?: number) => {
    switch (st) {
      case 1: return COLORS.success;
      case 2: return COLORS.warning;
      case 3: return COLORS.warning;
      case 4: return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={sensor.name} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Timestamp */}
        <View style={styles.timestampCard}>
          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.timestampText}>
            Data diterima: {formatTimestamp(sensor.lastUpdated)}
          </Text>
        </View>

        {/* Kondisi Tanah */}
        <SectionHeader
          title="Kondisi Tanah"
          subtitle={`Pembaruan terakhir : ${getTimeAgo(sensor.lastUpdated)}`}
        />
        <View style={styles.row}>
          <GaugeCard label="N" value={sensor.soilData.N} />
          <GaugeCard label="P" value={sensor.soilData.P} />
          <GaugeCard label="K" value={sensor.soilData.K} />
        </View>
        <View style={styles.row}>
          <GaugeCard label="EC" value={sensor.soilData.EC} flex={1.2} />
          <GaugeCard label="pH" value={sensor.soilData.pH} flex={0.8} />
        </View>

        {/* Kondisi Lingkungan */}
        <View style={{ marginTop: SPACING.md }}>
          <SectionHeader title="Kondisi Lingkungan" subtitle="Suhu & Kelembaban" />
          <View style={styles.row}>
            <ParameterCard
              label="Suhu (t) :"
              value={`${sensor.soilData.temperature ?? 0} °C`}
              statusColor={COLORS.warning}
            />
            <ParameterCard
              label="Kelembaban (h) :"
              value={`${sensor.soilData.humidity ?? 0} %`}
              statusColor={COLORS.primary}
            />
          </View>
        </View>

        {/* Rekomendasi Pupuk */}
        <View style={{ marginTop: SPACING.md }}>
          <SectionHeader title="Rekomendasi Pupuk" subtitle={`Pembaruan terakhir : ${getTimeAgo(sensor.lastUpdated)}`} />
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.push({
              pathname: '/(soil)/(analisis)',
              params: { sensorId: sensor.id },
            })}
          >
            <Text style={styles.outlineBtnText}>Isi Data Pupuk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => setShowHistory(true)}>
            <Text style={styles.outlineBtnText}>History Pemupukan</Text>
          </TouchableOpacity>
        </View>

        {/* Status Sensor */}
        <View style={{ marginTop: SPACING.md }}>
          <SectionHeader title="Status Sensor" subtitle={`Pembaruan terakhir : ${getTimeAgo(sensor.lastUpdated)}`} />
          <View style={styles.row}>
            <ParameterCard
              label="Battery (bt) :"
              value={`${sensor.status.battery}%`}
              statusColor={sensor.status.battery > 30 ? COLORS.success : COLORS.danger}
            />
            <ParameterCard
              label="Battery Health :"
              value={sensor.status.batteryHealth}
            />
          </View>
          <View style={styles.row}>
            <ParameterCard
              label="Voltage (vb) :"
              value={`${sensor.status.voltage ?? 0} V`}
              statusColor={COLORS.textSecondary}
            />
            <ParameterCard
              label="RSSI :"
              value={`${sensor.status.rssi ?? 0} dBm`}
              statusColor={(sensor.status.rssi ?? 0) > -80 ? COLORS.success : COLORS.warning}
            />
          </View>
          <View style={styles.row}>
            <ParameterCard
              label="LoRa Status :"
              value={sensor.status.loraStatus}
            />
            <ParameterCard
              label="Status (st) :"
              value={getStatusLabel(sensor.status.statusCode)}
              statusColor={getStatusColor(sensor.status.statusCode)}
            />
          </View>
          <View style={styles.row}>
            <ParameterCard
              label="GPS :"
              value={sensor.location ? 'Aktif ✓' : 'Belum diukur'}
              statusColor={sensor.location ? COLORS.success : COLORS.warning}
            />
            <ParameterCard
              label="Koordinat :"
              value={sensor.location
                ? `${sensor.location.latitude.toFixed(4)}, ${sensor.location.longitude.toFixed(4)}`
                : `${0}, ${0}`
              }
              statusColor={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* GPS / Lokasi Sawah */}
        <View style={{ marginTop: SPACING.md }}>
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Lokasi Sawah</Text>
            {sensor.location ? (
              <View style={styles.gpsInfo}>
                <Ionicons name="location" size={28} color={COLORS.primaryLight} />
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={styles.coordText}>📍 {formatCoordinates(sensor.location)}</Text>
                  <Text style={styles.coordSubText}>Akurasi: {sensor.location.accuracy?.toFixed(1) ?? '?'} m</Text>
                  <Text style={styles.coordSubText}>Diperbarui: {getTimeAgo(sensor.location.timestamp)}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="location-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.mapEmptyText}>Lokasi belum diukur</Text>
              </View>
            )}
            <TouchableOpacity style={styles.gpsBtn} onPress={handleGetGPS} disabled={loadingGPS}>
              {loadingGPS ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="locate" size={16} color={COLORS.white} />
                  <Text style={styles.gpsBtnText}>
                    {sensor.location ? 'Perbarui Lokasi GPS' : 'Ambil Lokasi GPS'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Modal: Fertilizer Form */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <FertilizerForm onSubmit={handleFertilizerSubmit} onCancel={() => setShowForm(false)} />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: History */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.historyModal}>
            <Text style={styles.historyTitle}>History Pemupukan</Text>
            <ScrollView>
              {sensor.fertilizationHistory.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada data pemupukan</Text>
              ) : (
                sensor.fertilizationHistory.map((rec: FertilizationRecord) => (
                  <View key={rec.id} style={styles.historyItem}>
                    <Text style={styles.historyDate}>{new Date(rec.date).toLocaleDateString('id-ID')}</Text>
                    <Text style={styles.historyType}>{rec.type}</Text>
                    <Text style={styles.historyAmount}>{rec.amount} kg/ha</Text>
                    {rec.note ? <Text style={styles.historyNote}>{rec.note}</Text> : null}
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => setShowHistory(false)}>
              <Text style={styles.outlineBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.md },
  timestampCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
    gap: 6,
  },
  timestampText: { color: COLORS.textMuted, fontSize: 11 },
  row: { flexDirection: 'row', marginBottom: SPACING.xs },
  outlineBtn: {
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.sm,
  },
  outlineBtnText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 15 },
  mapCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.primary,
  },
  mapTitle: {
    color: COLORS.white, fontSize: 14, fontWeight: '700', textAlign: 'center',
    paddingVertical: SPACING.sm, backgroundColor: COLORS.primaryDark,
  },
  mapPlaceholder: {
    height: 130, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLight,
  },
  mapEmptyText: { color: COLORS.textMuted, marginTop: SPACING.sm, fontSize: 13 },
  gpsInfo: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACING.md, backgroundColor: COLORS.card },
  coordText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  coordSubText: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  gpsBtn: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: SPACING.sm, margin: SPACING.sm, borderRadius: BORDER_RADIUS.md,
  },
  gpsBtnText: { color: COLORS.white, fontWeight: '700', marginLeft: SPACING.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
  historyModal: {
    backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, maxHeight: '80%', borderWidth: 1, borderColor: COLORS.primary,
  },
  historyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.md },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginVertical: SPACING.lg },
  historyItem: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.primaryLight,
  },
  historyDate: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  historyType: { color: COLORS.primaryDark, fontSize: 14, fontWeight: '700' },
  historyAmount: { color: COLORS.primary, fontSize: 13, marginTop: 2 },
  historyNote: { color: COLORS.textMuted, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});