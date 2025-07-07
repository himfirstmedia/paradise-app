// components/HalfDonutChart.tsx
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { ThemedText } from "./ThemedText";

interface HalfDonutChartDataItem {
  value: number;
  color?: string;
  text?: string;
}

interface HalfDonutChartProps {
  data?: HalfDonutChartDataItem[];
  height?: number;
  radius?: number;
  innerRadius?: number;
  showText?: boolean;
  textStyle?: StyleProp<TextStyle>;
  centerLabelComponent?: () => React.ReactNode;
  showLegend?: boolean;
  legendTitle?: string;
  legendContainerStyle?: StyleProp<ViewStyle>;
  legendTextStyle?: StyleProp<TextStyle>;
  legendTitleStyle?: StyleProp<TextStyle>;
  showGradient?: boolean;
  strokeWidth?: number;
  strokeColor?: any;
}

export const HalfDonutChart: React.FC<HalfDonutChartProps> = ({
  data = [],
  height = 220,
  radius = 90,
  innerRadius = 60,
  showText = true,
  textStyle,
  showLegend = true,
  legendTitle,
  legendContainerStyle,
  legendTextStyle,
  legendTitleStyle,
  showGradient = false,
  centerLabelComponent,
  strokeWidth = 4,
  strokeColor,
}) => {

  const primarycolor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "chartBg")
  const total = data.reduce((sum: number, d) => sum + d.value, 0);

  // Set a fixed width for the chart (e.g., 180 or based on radius)
  const chartWidth = radius * 2 + 20; // 20 for padding



  const renderDot = (color: string) => (
    <View style={[styles.dot, { backgroundColor: color }]} />
  );

  const renderLegend = () => (
    <View style={[styles.legendContainer, legendContainerStyle]}>
      {legendTitle && (
        <ThemedText type="title" style={[styles.legendTitle, legendTitleStyle]}>
          {legendTitle}
        </ThemedText>
      )}
      {data.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          {renderDot(item.color || "#000")}
          <Text style={[styles.legendText, legendTextStyle]}>
            {item.text || `Item ${index + 1}`}
          </Text>
        </View>
      ))}
    </View>
  );

  const dataSum = data.reduce((sum, d) => sum + d.value, 0);
let displayData = data;
if (dataSum < 1) {
  displayData = [
    ...data,
    { value: 1 - dataSum, color: bgColor, text: "" },
  ];
}

  return (
  <View style={[styles.container, { height }]}>
    <View style={styles.chartRow}>
      <View
        style={[
          styles.chartContainer,
          {
            width: chartWidth,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >

        {/* Main PieChart */}
        <PieChart
          data={displayData}
          donut
          showGradient={showGradient}
          sectionAutoFocus
          radius={radius}
          innerRadius={innerRadius}
          innerCircleColor={primarycolor}
          focusOnPress
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
        />
        {showText && (
          <View style={styles.centerLabel}>
            {centerLabelComponent ? (
              centerLabelComponent()
            ) : (
              <Text style={[styles.centerText, textStyle]}>{total}%</Text>
            )}
          </View>
        )}
      </View>
      {showLegend && (
        <View style={{ flex: 1, minWidth: 80 }}>{renderLegend()}</View>
      )}
    </View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    minHeight: 180,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 180,
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",

  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  dot: {
    height: 16,
    width: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendContainer: {
    flexDirection: "column",
    justifyContent: "center",
    flexShrink: 1,
  },
  legendTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
