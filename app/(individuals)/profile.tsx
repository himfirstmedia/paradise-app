// /* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, Alert } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";
import { Image } from "expo-image";
import { UserSessionUtils } from "@/utils/UserSessionUtils";

type ActionButton = {
  icon: any;
  label: string;
  route: string;
};

type User = {
  fullName?: string;
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
};

const ACTION_BUTTONS: ActionButton[] = [
  {
    icon: require("../../assets/icons/edit-profile.png"),
    label: "Edit Profile",
    route: "../edit-profile",
  },
  {
    icon: require("../../assets/icons/change-password.png"),
    label: "Change Password",
    route: "/change-password",
  },
  
];

export default function TabThreeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const primaryColor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "input");
  const navigation = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await UserSessionUtils.getUserDetails();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
      try {
        await UserSessionUtils.logout();
        navigation.replace("../auth"); // Use replace to prevent going back
      } catch {
        Alert.alert("Logout Failed", "An error occurred during logout.");
      }
    };

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            flex: 1,
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[styles.headerCard, { backgroundColor: primaryColor }]}
          >
            <View style={[styles.row]}>
              <View>
                <ThemedText
                  type="title"
                  style={{ width: "100%", color: "#FFFFFF" }}
                >
                  Profile
                </ThemedText>
              </View>
            </View>
            <View
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                marginVertical: "5%",
                paddingHorizontal: 10,
                flexDirection: "row",
                gap: 30,
              }}
            >
              <View style={{ marginBottom: "0%" }}>
                <Avatar size={100} />
              </View>
              <View style={{ flexDirection: "column", gap: 4 }}>
                <ThemedText type="title" style={{ color: "#FFFFFF" }}>
                  {user?.name}
                </ThemedText>
                <ThemedText type="default" style={{ color: "#FFFFFF" }}>
                  {user?.phone}
                </ThemedText>
                <ThemedText type="default" style={{ color: "#FFFFFF" }}>
                  {user?.email}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <View style={{ gap: 8 }}>
              {ACTION_BUTTONS.map((btn, idx) => (
                <ProfileActionButton
                  key={idx}
                  icon={btn.icon}
                  label={btn.label}
                  route={btn.route}
                  bgColor={bgColor}
                  navigation={navigation}
                />
              ))}
              <View style={{ marginTop: "10%" }}>
                <ProfileActionButton
                label="Logout"
                route="../auth"
                bgColor={bgColor}
                navigation={navigation}
                onPress={handleLogout} 
              />
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </>
  );
}

type ProfileActionButtonProps = {
  icon?: any;
  label: string;
  route: string;
  bgColor?: string;
  navigation: ReturnType<typeof useRouter>;
  onPress?: () => void;
};

function ProfileActionButton({
  icon,
  label,
  route,
  bgColor,
  navigation,
  onPress,
}: ProfileActionButtonProps) {
  return (
    <Pressable
      style={[styles.row, styles.button, { backgroundColor: bgColor }]}
      onPress={onPress ? onPress : () => navigation.push(route as any)}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        {icon && <Image source={icon} style={styles.icon} />}
        <ThemedText type="default">{label}</ThemedText>
      </View>
      <Image
        source={require("../../assets/icons/chevron-right.png")}
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  subContainer: {
    width: "100%",
    paddingHorizontal: 15,
  },
  stepContainer: {
    gap: 8,
  },
  headerCard: {
    height: 200,
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
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
    paddingHorizontal: 15,
    borderRadius: 15,
  },
});
