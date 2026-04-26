

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { mqqtMessageAtom } from '@/store/atom';
import { useAtomValue } from 'jotai';

import { GaugeCard } from '@/components/device/GaugeCard';
import { ParameterCard } from '@/components/device/ParameterCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const calculateProgress = (value: number, min: number, max: number) => {
  if (value < min) return 0;
  if (value > max) return 1;
  return (value - min) / (max - min);
};



export default function DeviceScreen() {
  const messages = useAtomValue(mqqtMessageAtom);

  const [currentData, setCurrentData] = useState({
    timestamp: null,
    N: null,
    P: null,
    K: null,
    EC: null,
    pH: null,
    TempOut: null,
    HumOut: null,
    Lux: null,
    PresOut: null,
  });

  const saveData = async (id: string, data: {}) => {
    await AsyncStorage.setItem(id, JSON.stringify(data));
  };

  const loadData = async (id: string) => {
    const value = await AsyncStorage.getItem(id);
    if (value) setCurrentData(JSON.parse(value));
  };

  const { id } = useLocalSearchParams();
  // console.log('All Messages:', messages);
  const latestMessage = JSON.parse(messages[0]?.message || '{}') || {};
  const devid = latestMessage.DeviceId;
  // console.log(id, devid)

  if (devid) {
    saveData(`device-${devid}`, latestMessage);
  } else {
    saveData(`device-${id}`, {});
  }

  // get devid from async storage by id
  // let storedDevice = await AsyncStorage.getItem(`device-${id}`);
  loadData(`device-${id}`);

  // uncomment ae lek mau pakai timestamp dari arduino, tadi harus ngirim timestamp arduiino sender e
  // let terhubung = currentData.timestamp !== null && ((Date.now() - new Date(currentData.timestamp).getTime()) < 60000);
  // let terhubung = currentData.N !== null;

  let terhubung = devid == id;
  console.log('Device ID:', devid, 'Expected ID:', id, 'Connected:', terhubung);

  return (
    <SafeAreaView  style={styles.container} >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header Utama */}
        <View style={styles.header}>
          {/* JUDUL DAN IKON DIUBAH */}
          <Text style={styles.title}>🍃 Sensor {id}</Text>
          <Text style={styles.subtitle}>Data Tanah & Lingkungan Secara Langsung</Text>
          <Text style={styles.updateText}>
            Pembaruan terakhir: {currentData?.timestamp ? new Date(currentData.timestamp).toLocaleTimeString() : 'No data'}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status Pesan</Text>
            <View style={styles.statusIndicatorRow}>
              <View style={[
                styles.statusDot,
                { backgroundColor: terhubung ? '#10b981' : '#ffd001ff' }
              ]} />
              <Text style={[
                styles.statusText,
                {
                  backgroundColor: terhubung ? '#dcfce7' : '#f0dd8cff',
                  color: terhubung ? '#166534' : '#3b3835ff'
                }
              ]}>
                {terhubung ? 'Masuk' : 'Standby'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Section Soil Parameters */}
        <Text style={styles.sectionTitle}>🌱 Kondisi Tanah</Text>
        <View style={styles.cardRow}>
          <ParameterCard label="Nitrogen" value={Number(currentData.N || 0).toFixed(1)} unit="mg/kg" icon={<Text style={styles.iconText}>N</Text>} />
          <ParameterCard label="Fosfor" value={Number(currentData.P || 0).toFixed(1)} unit="mg/kg" icon={<Text style={styles.iconText}>P</Text>} />
          <ParameterCard label="Kalium" value={Number(currentData.K || 0).toFixed(1)} unit="mg/kg" icon={<Text style={styles.iconText}>K</Text>} />
        </View>
        <View style={styles.cardRow}>
          <ParameterCard label="Konduktivitas" value={Number(currentData.EC || 0).toFixed(1)} unit="μs/cm" icon={<Text style={styles.iconEmoji}>⚡️</Text>} />
          <ParameterCard label="Tingkat Keasaman" value={Number(currentData.pH || 0).toFixed(1)} unit="pH" icon={<Text style={styles.iconEmoji}>🧪</Text>} />
        </View>

        {/* 3. Section Environment Statistics */}
        <Text style={styles.sectionTitle}>🏡 Kondisi Lingkungan</Text>
        <View style={styles.cardRowWrap}>
          <GaugeCard label="Suhu" value={Number(currentData.TempOut || 0).toFixed(1)} unit="°C" progress={calculateProgress(currentData.TempOut || 0, 0, 50)} icon={<Text style={styles.iconEmoji}>🌡️</Text>} />
          <GaugeCard label="Kelembaban" value={Number(currentData.HumOut || 0).toFixed(1)} unit="%" progress={calculateProgress(currentData.HumOut || 0, 0, 100)} icon={<Text style={styles.iconEmoji}>💧</Text>} />
          <GaugeCard label="Intensitas Cahaya" value={Number(currentData.Lux || 0).toFixed(0)} unit="lux" progress={calculateProgress(currentData.Lux || 0, 0, 2000)} icon={<Text style={styles.iconEmoji}>☀️</Text>} />
          <GaugeCard label="Tekanan" value={Number(currentData.PresOut || 0).toFixed(1)} unit="hPa" progress={calculateProgress(currentData.PresOut || 0, 900, 1100)} icon={<Text style={styles.iconEmoji}>📊</Text>} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#166534',
  },
  subtitle: {
    fontSize: 14,
    color: '#15803d',
  },
  updateText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14532d',
    marginBottom: 16,
    marginTop: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  cardRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  iconEmoji: {
    fontSize: 24,
  },
  statusCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 14,
  },
});