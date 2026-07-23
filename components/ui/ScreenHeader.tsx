// components/ui/ScreenHeader.tsx
import React from "react";
import { Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void; // opsional, default pakai router.back()
}

function BackArrowIcon() {
  return (
    <Svg width={29} height={29} viewBox="0 0 29 29" fill="none">
      <Path
        d="M6.31153 13.5247H24.3445C24.5836 13.5247 24.813 13.6197 24.982 13.7887C25.1511 13.9578 25.2461 14.1872 25.2461 14.4263C25.2461 14.6654 25.1511 14.8948 24.982 15.0639C24.813 15.233 24.5836 15.328 24.3445 15.328H6.31153C6.0724 15.328 5.84306 15.233 5.67397 15.0639C5.50488 14.8948 5.40988 14.6654 5.40988 14.4263C5.40988 14.1872 5.50488 13.9578 5.67397 13.7887C5.84306 13.6197 6.0724 13.5247 6.31153 13.5247Z"
        fill="white"
      />
      <Path
        d="M6.68347 14.4264L14.1643 21.9016C14.2483 21.9856 14.315 22.0853 14.3604 22.195C14.4059 22.3048 14.4293 22.4224 14.4293 22.5412C14.4293 22.66 14.4059 22.7776 14.3604 22.8873C14.315 22.9971 14.2483 23.0968 14.1643 23.1808C14.0803 23.2648 13.9806 23.3314 13.8709 23.3769C13.7611 23.4223 13.6435 23.4457 13.5247 23.4457C13.4059 23.4457 13.2883 23.4223 13.1786 23.3769C13.0688 23.3314 12.9691 23.2648 12.8851 23.1808L4.77029 15.066C4.68595 14.9822 4.61901 14.8825 4.57334 14.7727C4.52766 14.663 4.50415 14.5452 4.50415 14.4264C4.50415 14.3075 4.52766 14.1897 4.57334 14.08C4.61901 13.9702 4.68595 13.8705 4.77029 13.7867L12.8851 5.67192C12.9691 5.58792 13.0688 5.52129 13.1786 5.47584C13.2883 5.43038 13.4059 5.40698 13.5247 5.40698C13.6435 5.40698 13.7611 5.43038 13.8709 5.47584C13.9806 5.52129 14.0803 5.58792 14.1643 5.67192C14.2483 5.75591 14.315 5.85563 14.3604 5.96537C14.4059 6.07511 14.4293 6.19274 14.4293 6.31152C14.4293 6.43031 14.4059 6.54793 14.3604 6.65768C14.315 6.76742 14.2483 6.86713 14.1643 6.95113L6.68347 14.4264Z"
        fill="white"
      />
    </Svg>
  );
}

export default function ScreenHeader({
  title,
  onBackPress,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    
    <LinearGradient
      colors={["#105C2E", "#8C6A09"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        width: "100%",
        height: 58.13,
        borderBottomLeftRadius: 25.458,
        borderBottomRightRadius: 25.458,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      <Pressable
        onPress={handleBack}
        hitSlop={10}
        style={{
          position: "absolute",
          left: 20,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1.697 },
          shadowOpacity: 0.5,
          shadowRadius: 1.697,
        }}
      >
        <BackArrowIcon />
      </Pressable>

      <View style={{ flex: 1, alignItems: "center" }}>
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "PoppinsBold",
            fontSize: 23.337,
            textShadowColor: "rgba(0, 0, 0, 0.15)",
            textShadowOffset: { width: 0, height: 1.697 },
            textShadowRadius: 1.697,
          }}
        >
          {title}
        </Text>
      </View>
    </LinearGradient>
  );
}