import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const normalizeHouseName = (name: string) =>
  name ? name.trim().replace(/\s+/g, "_") : " ";

export default function Reports() {
  const primaryColor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "input");
  const navigation = useRouter();
  const { houses, loading: housesLoading, getDisplayName } = useReduxHouse();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
  const timeout = setTimeout(() => {
    if (!houses || houses.length === 0) {
      setHasTimedOut(true);
    }
  }, 500); // 5 seconds timeout

  return () => clearTimeout(timeout); // cleanup on unmount
}, [houses]);

  const residentReports = useMemo(() => {
    // Filter out administration houses if needed
    return houses
      .filter((house) => !house.name.includes("Administration"))
      .map((house) => ({
        label: getDisplayName(house.name),
        route: "/report-details" as const,
        params: {
          type: "house",
          house: normalizeHouseName(house.name),
          houseId: house.id,
        },
      }));
  }, [houses, getDisplayName]);

  if (housesLoading && !hasTimedOut) {
  return (
    <ThemedView style={[styles.container, { alignItems: "center" }]}>
      <ActivityIndicator
        size="large"
        color={primaryColor}
        style={{ marginTop: "5%" }}
      />
    </ThemedView>
  );
}

if (hasTimedOut && (!houses || houses.length === 0)) {
  return (
    <ThemedView style={[styles.container, { alignItems: "center" }]}>
      <ThemedText type="default" style={{ marginTop: 10 }}>
        Failed to load houses. Please try again later.
      </ThemedText>
    </ThemedView>
  );
}



  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Resident Reports
      </ThemedText>

      <View style={{ gap: 8, width: "100%" }}>
        {residentReports.length === 0 ? (
          <ThemedText type="default" style={{ marginTop: 10 }}>
            There are no houses present to generate reports.
          </ThemedText>
        ) : (
          <View style={{ gap: 8, width: "100%" }}>
            {residentReports.map((btn, idx) => (
              <ProfileActionButton
                key={idx}
                label={btn.label}
                route={btn.route}
                params={btn.params}
                bgColor={bgColor}
                navigation={navigation}
              />
            ))}
          </View>
        )}
      </View>

      <ThemedText type="title" style={[styles.title, { marginTop: "8%" }]}>
        Individual Reports
      </ThemedText>

      <Pressable
        style={[
          styles.row,
          styles.button,
          { backgroundColor: bgColor, width: "100%" },
        ]}
        onPress={() =>
          navigation.push({
            pathname: "/report-details",
            params: { type: "individuals" },
          })
        }
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ThemedText type="default">Get report</ThemedText>
        </View>
        <Image
          source={require("@/assets/icons/chevron-right.png")}
          style={styles.icon}
        />
      </Pressable>
    </ThemedView>
  );
}

type ProfileActionButtonProps = {
  label: string;
  route: "/report-details";
  params: Record<string, any>;
  bgColor?: string;
  navigation: ReturnType<typeof useRouter>;
};

function ProfileActionButton({
  label,
  route,
  params,
  bgColor,
  navigation,
}: ProfileActionButtonProps) {
  return (
    <Pressable
      style={[styles.row, styles.button, { backgroundColor: bgColor }]}
      onPress={() => navigation.push({ pathname: route, params })}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <ThemedText type="default">{label}</ThemedText>
      </View>
      <Image
        source={require("@/assets/icons/chevron-right.png")}
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "left",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    height: 20,
    width: 20,
  },
  button: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 15,
  },
});
