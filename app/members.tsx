import { AdministratorCard } from "@/components/AdministratorCard";
import { MemberCard } from "@/components/MemberCard";
import { ThemedView } from "@/components/ThemedView";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserSessionUtils } from "@/utils/UserSessionUtils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";

export default function MembersScreen() {
  const navigation = useRouter();
  const primaryColor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "background");
  const { members } = useReduxMembers();

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await UserSessionUtils.getUserDetails();
      setCurrentUserRole(user?.role ?? null);
    })();
  }, []);

  const showAdminCard =
    currentUserRole === "DIRECTOR" || currentUserRole === "SUPER_ADMIN";

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "flex-start",
          width: "100%",
          paddingBottom: "30%",
        }}
        style={[styles.innerContainer]}
      >
        {showAdminCard && <AdministratorCard members={members} />}

        <MemberCard members={members} />
      </ScrollView>

      <Pressable
        style={[styles.floatingBtn, { backgroundColor: primaryColor }]}
        onPress={() => {
          navigation.push("/add-member");
        }}
      >
        <Image source={require("@/assets/icons/add.png")} style={styles.icon} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  floatingBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },
});
