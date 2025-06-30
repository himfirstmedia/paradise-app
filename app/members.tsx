import { AdministratorCard } from "@/components/AdministratorCard";
import { MemberCard } from "@/components/MemberCard";
import { ThemedView } from "@/components/ThemedView";
import { useReduxAuth } from "@/hooks/useReduxAuth"; // Changed to use auth hook
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";

export default function MembersScreen() {
  const navigation = useRouter();
  const primaryColor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "background");
  
  // Get members from redux
  const { members } = useReduxMembers();
  
  // Get current user from auth state
  const { user: currentUser } = useReduxAuth(); // Use auth hook to get current user
  
  // Determine if admin card should be shown
  const showAdminCard = currentUser?.role === "DIRECTOR" || currentUser?.role === "SUPER_ADMIN";

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.innerContainer}
      >
        {showAdminCard && <AdministratorCard members={members} />}
        <MemberCard members={members} />
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
    padding: 16,
  },
  scrollContent: {
    alignItems: "flex-start",
    width: "100%",
    paddingBottom: 120, // Use fixed value instead of percentage
  },
  innerContainer: {
    flex: 1,
    width: "100%",
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