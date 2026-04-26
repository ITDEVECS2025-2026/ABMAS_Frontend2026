import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSensorStore } from '@/store/sensorContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants';
import StatusBadge from '../../../components/ui/StatusBadge';
import { Sensor } from '../../../interfaces';

export default function DashboardScreen() {
    const router = useRouter();
    const { sensors, settings } = useSensorStore();

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Selamat Malam,</Text>
                        <Text style={styles.farmerName}>{settings.farmerName}</Text>
                    </View>
                    <TouchableOpacity style={styles.avatar}>
                        <Ionicons name="person" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Status Card */}
                <View style={styles.statusCard}>
                    <StatusBadge label="Aman" type="success" />
                    <Text style={styles.statusText}>
                        Tidak Ada Aksi Yang Perlu Dilakukan, Aman
                    </Text>
                </View>

                {/* Sensor List */}
                <Text style={styles.sectionTitle}>List Sensor</Text>
                {sensors.map((sensor: Sensor) => (
                    <TouchableOpacity
                        key={sensor.id}
                        style={styles.sensorBtn}
                        onPress={() =>
                            router.push({
                                pathname: '/(soil)/(sensor)/[id]',
                                params: { id: sensor.id },
                            })
                        }
                    >
                        <Text style={styles.sensorBtnText}>{sensor.name}</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                ))}

                {/* Map Placeholder */}
                <View style={styles.mapCard}>
                    <Text style={styles.mapTitle}>Lokasi Sawah</Text>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map" size={40} color={COLORS.primary} />
                        <Text style={styles.mapText}>Peta lokasi sawah</Text>
                    </View>
                </View>

                <View style={{ height: SPACING.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, padding: SPACING.md },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    greeting: { color: COLORS.textSecondary, fontSize: 13 },
    farmerName: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    },
    statusCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    statusText: { color: COLORS.textSecondary, fontSize: 13, marginTop: SPACING.sm },
    sectionTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: SPACING.sm },
    sensorBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sensorBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
    mapCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    mapTitle: {
        color: COLORS.white, fontSize: 14, fontWeight: '700',
        textAlign: 'center', paddingVertical: SPACING.sm, backgroundColor: COLORS.primaryDark,
    },
    mapPlaceholder: {
        height: 160, alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.surfaceLight,
    },
    mapText: { color: COLORS.textMuted, marginTop: SPACING.sm, fontSize: 13 },
});