// components/StatusSummaryCard.tsx
import React from "react";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

type StatusSummaryProps = {
  summary?: {
    beginningBalance?: string;
    currentBalance?: string;
    weekStatus?: string;
    monthStatus?: string;
    periodStatus?: string;
    currentPeriod?: string;
    daysRemaining?: number;  
  },
  background?: string;
  textColor?: string; // 👈 new optional prop
};

export function StatusSummaryCard({ summary, background, textColor }: StatusSummaryProps) {
  const primaryColor = useThemeColor({}, "selection");
  const themeTextColor = useThemeColor({}, "text");
  const backgroundThemeColor = useThemeColor({}, (background || "selection") as any);

  let resolvedBackground: string;

  if (background) {
    if (background.startsWith("#") || background.startsWith("rgb")) {
      resolvedBackground = background;
    } else {
      resolvedBackground = backgroundThemeColor;
    }
  } else {
    resolvedBackground = primaryColor;
  }

  // 👇 resolve text color based on props
  const resolvedTextColor =
    textColor || (background ? themeTextColor : "#fff");

  const safeSummary = summary || {
    beginningBalance: "0.0",
    currentBalance: "0.0",
    weekStatus: "0.0 / 0",
    monthStatus: "0.0 / 0",
    periodStatus: "0.0 / 0",
    currentPeriod: "0 days",
    daysRemaining: 0
  };

  return (
    <ThemedView style={[styles.card, { backgroundColor: resolvedBackground }]}>
      <ThemedText type="subtitle" style={{ color: resolvedTextColor }}>
        Current Status
      </ThemedText>
      <ThemedText type="default" style={[styles.statusText, { color: resolvedTextColor }]}>
        Beginning Balance (Previous Period): {safeSummary.beginningBalance} hrs
      </ThemedText>
      <ThemedText type="default" style={[styles.statusText, { color: resolvedTextColor }]}>
        This Week: {safeSummary.weekStatus} hrs
      </ThemedText>
      <ThemedText type="default" style={[styles.statusText, { color: resolvedTextColor }]}>
        This Month: {safeSummary.monthStatus} hrs
      </ThemedText>
      <ThemedText type="default" style={[styles.statusText, { color: resolvedTextColor }]}>
        This Period: {safeSummary.periodStatus}
      </ThemedText>
      <ThemedText type="default" style={[styles.statusText, { color: resolvedTextColor }]}>
        Current Balance: {safeSummary.currentBalance} hrs
      </ThemedText>
      <ThemedText type="default" style={[styles.statusText, { color: resolvedTextColor }]}>
        Days remaining in this period: {safeSummary.daysRemaining}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    width: "100%",
    gap: 6,
  },
  statusText: {
    color: "#FFF",
  },
});
