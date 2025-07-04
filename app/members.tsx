import { AdministratorCard } from "@/components/AdministratorCard";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function MembersScreen() {
  const navigation = useRouter();
  const primaryColor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "background");

  const { members, loading } = useReduxMembers();
  const { user: currentUser } = useReduxAuth();

  const nonAdminMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.role !== "SUPER_ADMIN" && member.role !== "DIRECTOR"
    );
  }, [members]);

  const showAdminCard =
    currentUser?.role === "DIRECTOR" || currentUser?.role === "SUPER_ADMIN";

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.innerContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={primaryColor}
            style={{ marginTop: "5%" }}
          />
        ) : nonAdminMembers.length === 0 ? (
          <ThemedText
            type="default"
            style={{
              textAlign: "center",
              marginTop: 24,
              color: "#888",
            }}
          >
            There are no members added yet.
          </ThemedText>
        ) : (
          <>
            {showAdminCard && <AdministratorCard members={members} />}
            <MemberCard members={members} />
          </>
        )}
      </ScrollView>

      <Pressable
        style={[styles.floatingBtn, { backgroundColor: primaryColor }]}
        onPress={() => navigation.push("/add-member")}
      >
        <Image
          source={require("@/assets/icons/add.png")}
          style={styles.icon}
        />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    width: "100%",
    paddingBottom: 120,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    padding: 16,
  },
  floatingBtn: {
    position: "absolute",
    bottom: "5%",
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
