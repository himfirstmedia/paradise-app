import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

type ActionButton = {
  icon?: any;
  label: string;
  route: string;
  type?: string;
  house?: string;
};

const ACTION_BUTTONS: ActionButton[] = [
  {
    label: "LLW House",
    route: "/report-details",
    type: "resident",
    house: "LLW House",
  },
  {
    label: "CE House",
    route: "/report-details",
    type: "resident",
    house: "CE House",
  },
];

export default function Reports() {
  const bgColor = useThemeColor({}, "input");
  const navigation = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Resident Reports
      </ThemedText>

      <View style={{ gap: 8, width: "100%" }}>
        {ACTION_BUTTONS.map((btn, idx) => (
          <ProfileActionButton
            key={idx}
            icon={btn.icon}
            label={btn.label}
            route={btn.route}
            bgColor={bgColor}
            navigation={navigation}
            type={btn.type}
            house={btn.house}
          />
        ))}
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
  icon?: any;
  label: string;
  route: string;
  bgColor?: string;
  type?: string;
  house?: string;
  navigation: ReturnType<typeof useRouter>;
};

function ProfileActionButton({
  icon,
  label,
  route,
  type,
  house,
  bgColor,
  navigation,
}: ProfileActionButtonProps) {
  return (
    <Pressable
      style={[styles.row, styles.button, { backgroundColor: bgColor }]}
      onPress={() =>
        navigation.push({ pathname: route as any, params: { type, house } })
      }
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
