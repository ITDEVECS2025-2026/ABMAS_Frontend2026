import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ScrollView,
    Text,
    View,
} from "react-native";

import { useSensorStore } from "@/store/sensorContext";
import ScreenHeader from "../../components/ui/ScreenHeader";
import SensorCard from "@/components/sensor/SensorCardGrid";

export default function MonitoringPage() {

    const {
        sensors,
        connected,
    } = useSensorStore();

    // Ambil sensor pertama
    const sensor = sensors[0];

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
            }}
        >
            <ScreenHeader title="Sensor 1" />

            <ScrollView>

                <Text
                    style={{
                        fontSize: 22,
                        fontFamily: "PoppinsBold",
                        marginTop: 40,
                        textAlign: "center",
                    }}>
                    Monitoring
                </Text>


                {sensor && (

                    <View
                        style={{
                            padding: 16,
                        }}
                    >

                        <Text>
                            {sensor.name}
                        </Text>

                        <SensorCard sensorId={sensor.id} />

                    </View>

                )}

            </ScrollView>

        </SafeAreaView>
    );
}