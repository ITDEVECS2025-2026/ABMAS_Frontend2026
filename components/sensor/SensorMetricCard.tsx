import React from "react";
import { Text, View } from "react-native";
import { Sprout, Leaf, ShieldCheck, Zap, FlaskConical, Thermometer, Droplets } from "lucide-react-native";
import { scale } from "../../utils/scale";

type MetricType = "N" | "P" | "K" | "EC" | "pH" | "Suhu" | "Kelembaban";

interface MetricCardProps {
  type: MetricType;
  value: number | string;
}

const UNITS: Record<MetricType, string> = {
  N: "mg/kg",
  P: "mg/kg",
  K: "mg/kg",
  EC: "mS/cm",
  pH: "",
  Suhu: "°C",
  Kelembaban: "%",
};

export default function MetricCard({ type, value }: MetricCardProps) {
  const unit = UNITS[type];
  const iconSize = scale(18);

  const getIcon = () => {
    switch (type) {
      case "N":
        return <Sprout size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      case "P":
        return <Leaf size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      case "K":
        return <ShieldCheck size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      case "EC":
        return <Zap size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      case "pH":
        return <FlaskConical size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      case "Suhu":
        return <Thermometer size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      case "Kelembaban":
        return <Droplets size={iconSize} color="#FFFFFF" strokeWidth={2} />;
      default:
        return null;
    }
  };

  const isSmallCard = type === "N" || type === "P" || type === "K";

  if (isSmallCard) {
    return (
      <View
        style={{
          width: scale(110),
          height: scale(100),
          marginBottom: scale(12),
          borderRadius: scale(4.393),
          backgroundColor: "#BDEABA",
          shadowColor: "#000000",
          shadowOffset: { width: scale(2), height: scale(2) },
          shadowOpacity: 0.5,
          shadowRadius: scale(2),
          elevation: 4,
          overflow: "visible",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: scale(37.462),
            borderRadius: scale(3.027),
            backgroundColor: "#2C8A40",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: scale(3),
            zIndex: 2,
            opacity: 1,
          }}
        >
          <View
            style={{
              height: scale(18),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {getIcon()}
          </View>

          <View
            style={{
              height: scale(18),
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "PoppinsBold",
                fontSize: scale(17.028),
                lineHeight: scale(18),
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              {type}
            </Text>
          </View>
        </View>

        <View
          style={{
            position: "absolute",
            top: scale(36),
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#000000",
              fontFamily: "PoppinsSemiBold",
              fontSize: scale(17.947),
              includeFontPadding: false,
              textAlignVertical: "center",
              lineHeight: scale(20),
            }}
          >
            {value}
          </Text>

          {unit ? (
            <Text
              style={{
                color: "#3A6B3A",
                fontFamily: "PoppinsSemiBold",
                fontSize: scale(12),
                includeFontPadding: false,
                textAlignVertical: "center",
                lineHeight: scale(15),
                marginTop: scale(2),
              }}
            >
              {unit}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  const isUnitBelow = type === "EC" || type === "pH";

  return (
    <View
      style={{
        width: scale(170),
        height: scale(95),
        marginBottom: scale(12),
        borderRadius: scale(4.393),
        backgroundColor: "#BDEABA",
        shadowColor: "#000000",
        shadowOffset: { width: scale(2), height: scale(2) },
        shadowOpacity: 0.5,
        shadowRadius: scale(2),
        elevation: 4,
        overflow: "visible",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: scale(41),
          borderRadius: scale(3.027),
          backgroundColor: "#2C8A40",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: scale(3),
          zIndex: 2,
          opacity: 1,
        }}
      >
        <View
          style={{
            height: scale(18),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {getIcon()}
        </View>
        <View
          style={{
            height: scale(18),
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "PoppinsBold",
              fontSize: scale(17.028),
              lineHeight: scale(18),
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
          >
            {type}
          </Text>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          top: scale(37.688),
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: isUnitBelow ? "column" : "row",
          gap: isUnitBelow ? 0 : scale(3),
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "PoppinsSemiBold",
            fontSize: scale(17.947),
            includeFontPadding: false,
            textAlignVertical: "center",
            lineHeight: scale(20),
          }}
        >
          {value}
        </Text>

        {unit ? (
          <Text
            style={{
              color: "#3A6B3A",
              fontFamily: "PoppinsSemiBold",
              fontSize: scale(12),
              includeFontPadding: false,
              textAlignVertical: "center",
              lineHeight: isUnitBelow ? scale(15) : scale(18),
              marginTop: isUnitBelow ? scale(3) : 0,
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
