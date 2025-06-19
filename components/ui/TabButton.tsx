import { StyleSheet, TouchableOpacity, Text, GestureResponderEvent } from "react-native";
import React from "react";

type TabButtonProps = {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onPress: (event: GestureResponderEvent) => void;
};

export function TabButton({ label, icon, active = false, onPress }: TabButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                active && styles.activeButton
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {icon}
            <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    activeButton: {
        backgroundColor: "#e0e0e0",
    },
    label: {
        color: "#333",
        fontSize: 14,
        marginTop: 4,
    },
    activeLabel: {
        color: "#007AFF",
        fontWeight: "bold",
    },
});
