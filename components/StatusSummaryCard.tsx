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
};

export function StatusSummaryCard({ summary, background }: StatusSummaryProps) {
  const primaryColor = useThemeColor({}, "selection");
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
      <ThemedText type="subtitle" style={styles.statusText}>
        Current Status
      </ThemedText>
      <ThemedText type="default" style={styles.statusText}>
        Beginning Balance (Previous Period): {safeSummary.beginningBalance} hrs
      </ThemedText>
      <ThemedText type="default" style={styles.statusText}>
        This Week: {safeSummary.weekStatus} hrs
      </ThemedText>
      <ThemedText type="default" style={styles.statusText}>
        This Month: {safeSummary.monthStatus} hrs
      </ThemedText>
      <ThemedText type="default" style={styles.statusText}>
        This Period: {safeSummary.periodStatus}
      </ThemedText>
      <ThemedText type="default" style={styles.statusText}>
        Current Balance: {safeSummary.currentBalance} hrs
      </ThemedText>
      <ThemedText type="default" style={styles.statusText}>
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
