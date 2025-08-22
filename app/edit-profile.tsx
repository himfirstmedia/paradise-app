import {
  ThemedDatePicker,
  ThemedDropdown,
  ThemedEmailInput,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import api from "@/utils/api";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { User } from "@/redux/slices/userSlice";
import { useThemeColor } from "@/hooks/useThemeColor";

interface UserFormData {
  id: number | null;
  name: string;
  email: string;
  gender: string;
  phone: string;
  role: string;
  houseId: number | null;
  image: string | null;
  password: string;
  periodStart?: string;
  periodEnd?: string;
}

interface HouseData {
  id: number;
  name: string;
  abbreviation: string;
}

export default function EditProfileScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;
  const params = useLocalSearchParams();
  const { user: currentUser, updateCurrentUser } = useReduxAuth();

  const { houses } = useReduxHouse();
  const { members, reload: reloadMembers } = useReduxMembers();

  const userRole = currentUser?.role ?? "";
  const isPrivileged = ["MANAGER", "DIRECTOR"].includes(userRole);
  const isManager = ["MANAGER"].includes(userRole);

  // Get user ID from params
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = paramId ? Number(paramId) : currentUser?.id || null;

  // Find member in Redux store
  const member = userId ? members.find((m: User) => m.id === userId) : null;

  const [formData, setFormData] = useState<UserFormData>({
    id: null,
    name: "",
    email: "",
    gender: "",
    phone: "",
    role: "",
    houseId: null,
    image: null,
    password: "",
    periodStart: "",
    periodEnd: "",
  });

  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    console.log("Member Data: ", member);

    if (member) {
      setFormData({
        id: member.id,
        name: member.name ?? "",
        email: member.email ?? "",
        gender: member.gender ?? "",
        phone: member.phone ?? "",
        role: member.role ?? "",
        houseId: member.houseId || null,
        image: member.image || null,
        periodStart: member.periodStart || "",
        periodEnd: member.periodEnd || "",
        password: "",
      });
      setLoading(false);
    } else if (currentUser && !member) {
      setFormData({
        id: currentUser.id,
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
        gender: currentUser.gender ?? "",
        phone: currentUser.phone ?? "",
        role: currentUser.role ?? "",
        houseId: currentUser.houseId || null,
        image: currentUser.image || null,
        periodStart: currentUser.periodStart || "",
        periodEnd: currentUser.periodEnd || "",
        password: "",
      });
      setLoading(false);
    }
  }, [member, currentUser]);

  // Create a handler for each field
  const handleNameChange = (value: string) =>
    setFormData((prev) => ({ ...prev, name: value }));
  const handleEmailChange = (value: string) =>
    setFormData((prev) => ({ ...prev, email: value }));
  const handleGenderChange = (value: string) =>
    setFormData((prev) => ({ ...prev, gender: value }));
  const handlePhoneChange = (value: string) =>
    setFormData((prev) => ({ ...prev, phone: value }));
  const handleHouseChange = (value: number | null) => {
    setFormData((prev) => ({ ...prev, houseId: value }));
  };
  const handlePeriodStartChange = (value: string) => {
    setFormData((prev) => ({ ...prev, periodStart: value }));
  };
  const handlePeriodEndChange = (value: string) => {
    setFormData((prev) => ({ ...prev, periodEnd: value }));
  };

  const handleUpdate = useCallback(async () => {
    if (!formData.id) {
      Alert.alert("Error", "User ID is missing");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.password === "") {
        const { password, ...rest } = payload;
        await api.put(`/users/${formData.id}`, rest);
      } else {
        await api.put(`/users/${formData.id}`, payload);
      }

      const isValidGender = (val: string): val is User["gender"] =>
        ["MALE", "FEMALE", "OTHER"].includes(val);

      const isValidRole = (val: string): val is User["role"] =>
        ["SUPER_ADMIN", "DIRECTOR", "MANAGER", "RESIDENT"].includes(val);

      if (currentUser?.id === formData.id) {
        updateCurrentUser({
          // ...formData,
          id: formData.id,
          gender: isValidGender(formData.gender) ? formData.gender : undefined,
          role: isValidRole(formData.role) ? formData.role : undefined,
          image: formData.image ?? undefined,
          periodStart: formData.periodStart ?? undefined,
          periodEnd: formData.periodEnd ?? undefined,
        });
      }

      Alert.alert("Success", "Profile updated successfully!");
      await reloadMembers();
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  }, [formData, navigation, reloadMembers, currentUser?.id, updateCurrentUser]);

  const houseOptions = houses.map((house: HouseData) => ({
    label: house.name,
    value: house.id,
  }));

  const Dot = () => {
    return <ThemedText style={{ color: errorColor }}>*</ThemedText>;
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 5,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 100,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === "web" && { minHeight: "100%" },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.innerContainer}
        >
          <ThemedText type="title" style={{ marginBottom: 20 }}>
            Edit Profile
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Name <Dot />
            </ThemedText>
            <ThemedTextInput
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={handleNameChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Email Address <Dot />
            </ThemedText>
            <ThemedEmailInput
              placeholder="Enter your email address"
              value={formData.email}
              onChangeText={handleEmailChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Gender <Dot />
            </ThemedText>
            <ThemedDropdown
              placeholder="Select your gender"
              items={["MALE", "FEMALE"]}
              value={formData.gender}
              onSelect={handleGenderChange}
              multiSelect={false}
            />
          </ThemedView>
          {isManager && (
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                House <Dot />
              </ThemedText>
              <ThemedDropdown
                placeholder="Select house"
                items={houseOptions.map((h: { label: string }) => h.label)}
                value={
                  houseOptions.find(
                    (h: { value: number }) => h.value === formData.houseId
                  )?.label || ""
                }
                onSelect={(label) => {
                  const found = houseOptions.find(
                    (h: { label: string }) => h.label === label
                  );
                  handleHouseChange(found?.value || null);
                }}
              />
            </ThemedView>
          )}

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Phone <Dot />
            </ThemedText>
            <ThemedTextInput
              placeholder="Enter phone"
              value={formData.phone}
              onChangeText={handlePhoneChange}
            />
          </ThemedView>

          {isPrivileged && (
            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Period Start <Dot />
                  </ThemedText>
                  <ThemedDatePicker
                    placeholder="Select start date"
                    value={formData.periodStart}
                    onChangeText={(text) => {
                      handlePeriodStartChange(text);
                    }}
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Period End <Dot />
                  </ThemedText>
                  <ThemedDatePicker
                    placeholder="Select end date"
                    value={formData.periodEnd}
                    onChangeText={(text) => {
                      handlePeriodEndChange(text);
                    }}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={{ marginTop: 20, width: "100%" }}>
            <Button
              type="default"
              title="Update Profile"
              onPress={handleUpdate}
              loading={loading}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: 15,
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    width: "100%",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  innerContainer: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
});
