// components/sensor/StatusSensorCard.tsx
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Wifi, BatteryFull, HeartPulse, Navigation } from "lucide-react-native";
import { scale } from "@/utils/scale";
import { getTimeAgo } from "@/utils/gps";

interface StatusSensorCardProps {
    battery: number;
    batteryHealth: string;
    loraStatus: string;
    gpsActive: boolean;
    lastUpdated: number;    // timestamp unix, untuk "Pembaruan terakhir"
}

export default function StatusSensorCard({
    battery,
    batteryHealth,
    loraStatus,
    gpsActive,
    lastUpdated,
}: StatusSensorCardProps) {
    return (
        <View style={{ paddingHorizontal: scale(15), justifyContent: "center" }}>
            {/* Header gradient */}
            <LinearGradient
                colors={["#105C2E", "#8C6A09"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.6, y: 1 }}
                style={{
                    width: "100%",
                    height: scale(60),
                    borderTopLeftRadius: scale(16.868),
                    borderTopRightRadius: scale(16.868),
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8) }}>
                    <Wifi size={scale(23)} color="#FFFFFF" style={{marginTop: scale(-4)}} />
                    <Text
                        style={{
                            color: "#FFFFFF",
                            fontFamily: "PoppinsBold",
                            fontSize: scale(21.085),
                        }}
                    >
                        Status Sensor
                    </Text>
                </View>
                <Text
                    style={{
                        color: "#FFFFFF",
                        fontFamily: "PoppinsMedium",
                        fontSize: scale(12.651),
                        marginTop: scale(-7),
                    }}
                >
                    Pembaruan terakhir : {getTimeAgo(lastUpdated)}
                </Text>
            </LinearGradient>

            {/* Body */}
            <View
                style={{
                    width: "100%",
                    borderBottomLeftRadius: scale(8.434),
                    borderBottomRightRadius: scale(8.434),
                    backgroundColor: "#BDEBBB",
                    paddingHorizontal: scale(15),
                    paddingVertical: scale(15),
                    gap: scale(15),
                }}
            >
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: scale(15)}}>
                    <StatBox
                        icon={<BatteryFull size={scale(18)} color="#FFFFFF" />}
                        label="Battery"
                        value={`${battery}%`}
                    />
                    <StatBox
                        icon={<HeartPulse size={scale(18)} color="#FFFFFF" />}
                        label="Battery Health"
                        value={batteryHealth}
                    />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <StatBox
                        icon={<Wifi size={scale(18)} color="#FFFFFF" />}
                        label="LoRa Status"
                        value={loraStatus}
                    />
                    <StatBox
                        icon={<Navigation size={scale(18)} color="#FFFFFF" />}
                        label="GPS"
                        value={gpsActive ? "Connected" : "Disconnect"}
                    />
                </View>
            </View>
        </View>
    );
}

// ==========================================
// LOCAL COMPONENT — satu kotak stat (hijau solid)
// ==========================================
interface StatBoxProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function StatBox({ icon, label, value }: StatBoxProps) {
    return (
        <View
            style={{
                width: scale(152.5),
                borderRadius: scale(5),
                backgroundColor: "#2C8A40",
                paddingVertical: scale(3),
                alignItems: "center",
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6), paddingTop: scale(3) }}>
                {icon}
                <Text
                    style={{
                        color: "#FFFFFF",
                        textAlign: "center",
                        fontFamily: "PoppinsSemiBold",
                        marginTop: scale(3),
                        fontSize: scale(13),
                    }}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </View>
            <Text
                style={{
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontFamily: "PoppinsSemiBold",
                    fontSize: scale(18),
                    marginTop: scale(-2),
                }}
            >
                {value}
            </Text>
        </View>
    );
}