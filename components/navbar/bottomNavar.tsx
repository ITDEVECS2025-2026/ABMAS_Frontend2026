import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

import {
  House,
  History,
  ChartColumn,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const TAB_WIDTH = width / 3;

export default function BottomNavbar() {
  const router = useRouter();

  // 0 = Home
  // 1 = History
  // 2 = Monitoring
  const [activeIndex, setActiveIndex] = useState(0);

  // Posisi indikator
  const indicatorPosition = useSharedValue(0);

  // Animasi indikator
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: indicatorPosition.value,
        },
      ],
    };
  });

  // Fungsi pindah tab
  const changeTab = (
    index: number,
    route: string
  ) => {
    // Ganti icon aktif
    setActiveIndex(index);

    // Geser indikator
    indicatorPosition.value = withSpring(
      index * TAB_WIDTH,
      {
        damping: 11,
        stiffness: 80,
        mass: 0.7,
      }
    );

    // Pindah halaman
    router.push(route as any);
  };

  /*
  ========================================
  ICON AKTIF DI DALAM INDIKATOR
  ========================================
  */

  const ActiveIcon = () => {
    // HOME
    if (activeIndex === 0) {
      return (
        <House
          size={28}
          color="white"
        />
      );
    }

    // HISTORY
    if (activeIndex === 1) {
      return (
        <History
          size={28}
          color="white"
        />
      );
    }

    // MONITORING
    return (
      <ChartColumn
        size={28}
        color="white"
      />
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,

        width: "100%",
        height: 60,

        zIndex: 9999,
        elevation: 9999,
      }}
    >

      {/* ======================================== */}
      {/* BACKGROUND NAVBAR */}
      {/* ======================================== */}

      <LinearGradient
        colors={[
          "#105C2E",
          "#8C6A09",
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 0,
        }}
        style={{
          width: "100%",
          height: 60,

          flexDirection: "row",
          alignItems: "center",
        }}
      >

        {/* ======================================== */}
        {/* INDIKATOR AKTIF */}
        {/* ======================================== */}

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",

              width: TAB_WIDTH,

              // Tinggi indikator mengikuti circle 64px
              height: 64,

              alignItems: "center",

              // Circle naik 32px dari navbar
              top: -32.5,

              zIndex: 10,
            },

            animatedStyle,
          ]}
        >

          {/* ======================================== */}
          {/* CURVE PUTIH */}
          {/* DESIGN FIGMA TERBARU */}
          {/* 139px x 48px */}
          {/* ======================================== */}

          <Svg
            width={139}
            height={48}
            viewBox="0 0 139 48"
            fill="none"
            style={{
              position: "absolute",

              // Curve berada di bawah circle
              top: 32,
            }}
          >
            <Path
              d="M139 3.50366e-05C104 3.50366e-05 116.5 48 69.5 48C26 48 35 3.50366e-05 0 3.50366e-05C32.5 1.78705e-05 29.1162 1.78705e-05 67.5 1.78705e-05C105.884 1.78705e-05 101 3.05176e-05 139 3.50366e-05Z"
              fill="white"
            />
          </Svg>


          {/* ======================================== */}
          {/* CIRCLE AKTIF */}
          {/* DESIGN FIGMA */}
          {/* 64px x 64px */}
          {/* ======================================== */}

          <LinearGradient
            colors={[
              "#105C2E",
              "#8C6A09",
            ]}
            start={{
              x: 0,
              y: 1,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={{
              position: "absolute",

              top: 0,

              width: 64,
              height: 64,

              borderRadius: 32,

              justifyContent: "center",
              alignItems: "center",

              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 8,

              shadowOffset: {
                width: 0,
                height: 4,
              },

              elevation: 8,
            }}
          >

            {/* ICON TIDAK DIUBAH */}

            <ActiveIcon />

          </LinearGradient>

        </Animated.View>


        {/* ======================================== */}
        {/* HOME */}
        {/* Route: app/(main)/index.tsx */}
        {/* URL: / */}
        {/* ======================================== */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            changeTab(
              0,
              "/"
            );
          }}
          style={{
            width: TAB_WIDTH,
            height: 60,

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <House
            size={24}
            color="white"
          />
        </TouchableOpacity>


        {/* ======================================== */}
        {/* HISTORY */}
        {/* Route: app/(main)/history.tsx */}
        {/* URL: /history */}
        {/* ======================================== */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            changeTab(
              1,
              "/history"
            );
          }}
          style={{
            width: TAB_WIDTH,
            height: 60,

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <History
            size={24}
            color="white"
          />
        </TouchableOpacity>


        {/* ======================================== */}
        {/* MONITORING */}
        {/* Route: app/(main)/monitoring.tsx */}
        {/* URL: /monitoring */}
        {/* ======================================== */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            changeTab(
              2,
              "/monitoring"
            );
          }}
          style={{
            width: TAB_WIDTH,
            height: 60,

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ChartColumn
            size={24}
            color="white"
          />
        </TouchableOpacity>

      </LinearGradient>

    </View>
  );
}