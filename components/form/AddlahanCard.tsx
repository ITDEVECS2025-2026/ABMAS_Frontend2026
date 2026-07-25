// components/form/AddLahanCard.tsx
import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";
import { scale } from "../../utils/scale";
import { useRouter } from "expo-router";

interface AddLahanCardProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    placeholder?: string;
}

// ==========================================
// ICON: Plus dalam lingkaran hijau (header)
// ==========================================
function PlusCircleIcon() {
    const size = scale(27.585);
    return (
        <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
            <Path
                d="M13.7927 25.8614C20.4581 25.8614 25.8614 20.4581 25.8614 13.7927C25.8614 7.12743 20.4581 1.72412 13.7927 1.72412C7.12743 1.72412 1.72412 7.12743 1.72412 13.7927C1.72412 20.4581 7.12743 25.8614 13.7927 25.8614Z"
                fill="#4CAF50"
            />
            <Path d="M12.0691 8.04565H15.5173V19.5396H12.0691V8.04565Z" fill="white" />
            <Path d="M8.0459 12.0688H19.5398V15.517H8.0459V12.0688Z" fill="white" />
        </Svg>
    );
}

// ==========================================
// ICON: Edit/pencil (di kanan textbox, default)
// ==========================================
function EditIcon() {
    const size = scale(27.585);
    return (
        <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
            <G clipPath="url(#clip0_724_1253)">
                <Path
                    d="M25.0004 5.02397C25.3236 4.70066 25.5052 4.26221 25.5052 3.80504C25.5052 3.34788 25.3236 2.90943 25.0004 2.58611L23.7809 1.36661C23.4576 1.04339 23.0191 0.861816 22.562 0.861816C22.1048 0.861816 21.6663 1.04339 21.343 1.36661L17.0753 5.632L9.76059 12.9479L8.54224 17.8248L13.418 16.6053L20.7327 9.29052M20.7327 9.29052L17.0753 5.632M20.7327 9.29052L25.0004 5.02397M25.0004 5.02397L26.2187 6.24233C26.379 6.40244 26.5061 6.59255 26.5928 6.8018C26.6795 7.01105 26.7241 7.23533 26.7241 7.46184C26.7241 7.68834 26.6795 7.91262 26.5928 8.12187C26.5061 8.33112 26.379 8.52123 26.2187 8.68134L22.4131 12.4858"
                    stroke="#006134"
                    strokeWidth={1.18223}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M21.5509 16.379V24.9994C21.5509 25.4567 21.3692 25.8952 21.0459 26.2185C20.7226 26.5418 20.2841 26.7235 19.8268 26.7235H2.58591C2.12865 26.7235 1.69012 26.5418 1.36679 26.2185C1.04346 25.8952 0.861816 25.4567 0.861816 24.9994V7.75851C0.861816 7.30126 1.04346 6.86273 1.36679 6.5394C1.69012 6.21607 2.12865 6.03442 2.58591 6.03442H11.2063"
                    stroke="#006134"
                    strokeWidth={1.18223}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_724_1253">
                    <Rect width="27.5854" height="27.5854" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AddLahanCard({
    value,
    onChangeText,
    onSubmit,
    placeholder = "Contoh : Lahan 1",
}: AddLahanCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const router = useRouter(); 

    function focusInput() {
        inputRef.current?.focus();
    }

    function handleSubmit() {
        onSubmit();
        inputRef.current?.blur();
        setIsEditing(false);
        router.push("/(features)/(lahan)" as any);
    }

    return (
        <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 1 }}
            style={{
                width: scale(354),
                height: scale(113),
                borderRadius: scale(15.763),
                padding: scale(13),
                justifyContent: "space-between",
            }}
        >
            <Pressable
                onPress={focusInput}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: scale(10),
                }}
            >
                <PlusCircleIcon />
                <Text
                    style={{
                        color: "#FFFFFF",
                        fontFamily: "PoppinsBold",
                        fontSize: scale(18),
                    }}
                >
                    Tambah Lahan
                </Text>
            </Pressable>

            {/* Input box putih */}
            <TouchableWithoutFeedback onPress={focusInput}>
                <View
                    style={{
                        width: scale(310.139),
                        height: scale(50.048),
                        borderRadius: scale(10),
                        backgroundColor: "#FFFFFF",
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: scale(14),
                        justifyContent: "space-between",
                        alignSelf: "center",
                    }}
                >
                    <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setIsEditing(true)}
                        placeholder={placeholder}
                        placeholderTextColor="#1E1E1E"
                        style={{
                            flex: 1,
                            height: scale(50.048),          
                            color: "#1E1E1E",
                            fontFamily: "PoppinsItalic",
                            fontSize: scale(16),
                            includeFontPadding: false,       
                            textAlignVertical: "center",     
                            paddingVertical: 0,            
                        }}
                    />
                    {isEditing ? (
                        <Pressable
                            onPress={handleSubmit}
                            style={{
                                width: scale(88),
                                height: scale(29),
                                paddingHorizontal: scale(10),
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: scale(10),
                                backgroundColor: "#105C2E",
                            }}
                        >
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    textAlign: "center",
                                    fontFamily: "PoppinsMedium",
                                    includeFontPadding: false, 
                                    textAlignVertical: "center", 
                                    fontSize: scale(15),
                                }}
                            >
                                Tambah
                            </Text>
                        </Pressable>
                    ) : (
                        <EditIcon />
                    )}
                </View>
            </TouchableWithoutFeedback>
        </LinearGradient>
    );
}