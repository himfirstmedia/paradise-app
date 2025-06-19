// components/HalfDonutChart.tsx
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

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
  legendContainerStyle?: StyleProp<ViewStyle>;
  legendTextStyle?: StyleProp<TextStyle>;
  showGradient?: boolean;
  strokeWidth?: number;
  strokeColor?: any
}

export const HalfDonutChart: React.FC<HalfDonutChartProps> = ({
  data = [],
  height,
  radius = 90,
  innerRadius = 60,
  showText = true,
  textStyle,
  showLegend = true,
  legendContainerStyle,
  legendTextStyle,
  showGradient = false,
  centerLabelComponent,
  strokeWidth = 4,
  strokeColor,
}) => {
  const total = data.reduce((sum: number, d) => sum + d.value, 0);
  const primarycolor = useThemeColor({},"selection");

  const renderDot = (color: string) => (
    <View style={[styles.dot, { backgroundColor: color }]} />
  );

  const renderLegend = () => (
    <View style={[styles.legendContainer, legendContainerStyle]}>
      {data.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          {renderDot(item.color || '#000')}
          <Text style={[styles.legendText, legendTextStyle]}>
            {item.text || `Item ${index + 1}`}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          donut
          showGradient={showGradient}
          sectionAutoFocus
        //   startAngle={-90}
        //   endAngle={90}
          radius={radius}
          innerRadius={innerRadius}
          innerCircleColor={primarycolor}
          focusOnPress
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          // Ensure the PieChart version supports innerRadius for donut charts
        />
        
        {showText && (
          <View style={styles.centerLabel}>
            {centerLabelComponent ? centerLabelComponent() : (
              <Text style={[styles.centerText, textStyle]}>
                {total}%
              </Text>
            )}
          </View>
        )}
      </View>
      
      {showLegend && renderLegend()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dot: {
    height: 20,
    width: 20,
    borderRadius: 5,
    marginRight: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: "5%",
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendText: {
    fontSize: 12,
  },
});