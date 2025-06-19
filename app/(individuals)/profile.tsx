// /* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";
import { Image } from "expo-image";

export default function TabThreeScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const bgColor = useThemeColor({}, "input");
  const navigation = useRouter();

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            flex: 1,
            // paddingBottom: "80%"
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[styles.headerCard, { backgroundColor: primaryColor }]}
          >
            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <View>
                <ThemedText
                  type="title"
                  style={{ width: "100%", color: "#FFFFFF" }}
                >
                  Profile
                </ThemedText>
              </View>
            </ThemedView>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: "5%",
              }}
            >
              <View style={{marginBottom: "5%"}}>
              <Avatar size={110} />
              </View>
              <ThemedText type="title" style={{ color: "#FFFFFF" }}>
                John Doe
              </ThemedText>
              <ThemedText type="default" style={{ color: "#FFFFFF" }}>
                (individual)
              </ThemedText>
              <ThemedText type="default" style={{ color: "#FFFFFF" }}>
                johndoe@gmail.com
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <View style={{ gap: 8 }}>
              <Pressable
                style={[
                  styles.row,
                  styles.button,
                  { backgroundColor: bgColor },
                ]}
                onPress={() => navigation.push("../edit-profile")}
              >
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Image
                    source={require("../../assets/icons/edit-profile.png")}
                    style={styles.icon}
                  />
                  <ThemedText type="default">Edit Profile</ThemedText>
                </View>
                <Image
                  source={require("../../assets/icons/chevron-right.png")}
                  style={styles.icon}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.row,
                  styles.button,
                  { backgroundColor: bgColor },
                ]}
                onPress={() => navigation.push("/change-password")}
              >
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Image
                    source={require("../../assets/icons/change-password.png")}
                    style={styles.icon}
                  />
                  <ThemedText type="default">Change Password</ThemedText>
                </View>
                <Image
                  source={require("../../assets/icons/chevron-right.png")}
                  style={styles.icon}
                />
              </Pressable>
            </View>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </>
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
    height: "50%",
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingTop: "5%",
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
