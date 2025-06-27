import React, { useEffect, useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { StyleSheet } from "react-native";

export function Alert({
    message,
    type = "default",
    duration = 3000, // duration in ms, default 3 seconds
}: {
    message: string;
    type?: "default" | "error" | "success";
    duration?: number;
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const bgColor = useThemeColor(
        {
            light: type === "error" ? "#fdecea" : type === "success" ? "#e6f4ea" : undefined,
            dark: type === "error" ? "#5f2120" : type === "success" ? "#1b3c2b" : undefined,
        },
        "background"
    );
    const textColor = useThemeColor(
        {
            light: type === "error" ? "#611a15" : type === "success" ? "#1e4620" : undefined,
            dark: type === "error" ? "#fdecea" : type === "success" ? "#e6f4ea" : undefined,
        },
        "text"
    );

    if (!visible) return null;

    return (
        <ThemedView style={[styles.alertContainer, { backgroundColor: bgColor }]}>
            <ThemedText style={[styles.alertText, { color: textColor }]}>{message}</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    alertContainer: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    alertText: {
        fontSize: 16,
        textAlign: "center",
    },
});