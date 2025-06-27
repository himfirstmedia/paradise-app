import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
import { ThemedView } from "../ThemedView";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { useRouter, usePathname } from "expo-router";
import { UserSessionUtils } from "@/utils/UserSessionUtils";

type User = {
  fullName?: string;
  name?: string;
  email?: string;
  image?: string;
};

type AvatarProps = {
  size?: number;
};

export function Avatar({ size = 40 }: AvatarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const navigation = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await UserSessionUtils.getUserDetails();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const getInitial = () => {
    const displayName = user?.fullName || user?.name || "";
    if (!displayName) return "";
    return displayName.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    UserSessionUtils.logout();
    navigation.replace("/auth/login");
  };

  // Prevent modal if "profile" is in the URL
  const shouldShowModal = popoverVisible && !pathname.includes("profile");

  return (
    <>
      <TouchableOpacity onPress={() => setPopoverVisible(true)} activeOpacity={0.7}>
        <ThemedView style={[
          styles.container,
          { height: size, width: size, borderRadius: size / 2 }
        ]}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={{
              height: size,
              width: size,
              borderRadius: size / 2,
            }} />
          ) : (
            <ThemedView style={[
              styles.initialContainer,
              { height: size, width: size, borderRadius: size / 2 }
            ]}>
              <ThemedText type="default" style={[styles.initial, { fontSize: size * 0.5 }]}>
                {getInitial()}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>
      <Modal
        visible={shouldShowModal}
        transparent
        animationType="none"
        onRequestClose={() => setPopoverVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setPopoverVisible(false)}>
          <ThemedView style={styles.popover}>
            <Pressable style={styles.button} onPress={() => {}}>
              <ThemedText type="default">Profile</ThemedText>
            </Pressable>
            <Pressable style={styles.button} onPress={handleLogout}>
              <ThemedText type="default">Logout</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    // dynamic
  },
  initialContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    // fontWeight: 400,
    textAlign: "center",
    height: "100%",
    width: "100%",
    textAlignVertical: "center"

  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  popover: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 200,
    elevation: 5,
    shadowColor: "rgba(0, 0, 0, 0.03)",
    alignItems: "flex-start",
    marginTop: 50,
    marginRight: 15,
  },
  button: {
    paddingVertical: 5,
    width: "100%",
  },
});