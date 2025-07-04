import {
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
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  role: string;
  houseId: number | null;
  image: string | null;
  joinedDate: string | null;
  leavingDate: string | null;
  password: string;
}

export default function EditProfileScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser, updateCurrentUser } = useReduxAuth();

  const { houses } = useReduxHouse();
  const { members, reload: reloadMembers } = useReduxMembers();

  // Get user ID from params
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = paramId ? Number(paramId) : currentUser?.id || null;

  // Find member in Redux store
  const member = userId ? members.find((m) => m.id === userId) : null;

  const [formData, setFormData] = useState<UserFormData>({
    id: null,
    name: "",
    email: "",
    gender: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    role: "",
    houseId: null,
    image: null,
    joinedDate: null,
    leavingDate: null,
    password: "",
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

    if (member) {
      setFormData({
        id: member.id,
        name: member.name ?? "",
        email: member.email ?? "",
        gender: member.gender ?? "",
        city: member.city ?? "",
        state: member.state ?? "",
        zipCode: member.zipCode ?? "",
        phone: member.phone ?? "",
        role: member.role ?? "",
        houseId: member.houseId || null,
        image: member.image || null,
        joinedDate: member.joinedDate || null,
        leavingDate: member.leavingDate || null,
        password: "",
      });
      setLoading(false);
    } else if (currentUser && !member) {
      setFormData({
        id: currentUser.id,
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
        gender: currentUser.gender ?? "",
        city: currentUser.city ?? "",
        state: currentUser.state ?? "",
        zipCode: currentUser.zipCode ?? "",
        phone: currentUser.phone ?? "",
        role: currentUser.role ?? "",
        houseId: currentUser.houseId || null,
        image: currentUser.image || null,
        joinedDate: currentUser.joinedDate || null,
        leavingDate: currentUser.leavingDate || null,
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
  const handleCityChange = (value: string) =>
    setFormData((prev) => ({ ...prev, city: value }));
  const handleStateChange = (value: string) =>
    setFormData((prev) => ({ ...prev, state: value }));
  const handleZipCodeChange = (value: string) =>
    setFormData((prev) => ({ ...prev, zipCode: value }));
  const handlePhoneChange = (value: string) =>
    setFormData((prev) => ({ ...prev, phone: value }));
  const handleHouseChange = (value: number | null) => {
    setFormData((prev) => ({ ...prev, houseId: value }));
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
        [
          "SUPER_ADMIN",
          "ADMIN",
          "DIRECTOR",
          "RESIDENT_MANAGER",
          "FACILITY_MANAGER",
          "RESIDENT",
          "INDIVIDUAL",
        ].includes(val);

      if (currentUser?.id === formData.id) {
        updateCurrentUser({
          ...formData,
          id: formData.id ?? undefined,
          gender: isValidGender(formData.gender) ? formData.gender : undefined,
          role: isValidRole(formData.role) ? formData.role : undefined,
          image: formData.image ?? undefined,
          joinedDate: formData.joinedDate ?? undefined,
          leavingDate: formData.leavingDate ?? undefined,
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

  const houseOptions = houses.map((house) => ({
    label: house.name,
    value: house.id,
  }));

  const Dot = () => {
    return (
      <ThemedText style={{ color: errorColor }}>*</ThemedText>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            width: "100%",
            paddingBottom: "20%",
          }}
          showsVerticalScrollIndicator={false}
          style={styles.innerContainer}
        >
          <ThemedText type="title" style={{ marginBottom: 20 }}>
            Edit Profile
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Name <Dot /></ThemedText>
            <ThemedTextInput
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={handleNameChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Email Address <Dot /></ThemedText>
            <ThemedEmailInput
              placeholder="Enter your email address"
              value={formData.email}
              onChangeText={handleEmailChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Gender <Dot /></ThemedText>
            <ThemedDropdown
              placeholder="Select your gender"
              items={["MALE", "FEMALE"]}
              value={formData.gender}
              onValueChange={handleGenderChange}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">House <Dot /></ThemedText>
            <ThemedDropdown
              placeholder="Select house"
              items={houseOptions.map((h) => h.label)}
              value={
                houseOptions.find((h) => h.value === formData.houseId)?.label ||
                ""
              }
              onSelect={(label) => {
                const found = houseOptions.find((h) => h.label === label);
                handleHouseChange(found?.value || null);
              }}
            />
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedView style={{ width: "45%" }}>
              <ThemedText type="default">City <Dot /></ThemedText>
              <ThemedTextInput
                placeholder="Enter city"
                value={formData.city}
                onChangeText={handleCityChange}
              />
            </ThemedView>
            <ThemedView style={{ width: "45%" }}>
              <ThemedText type="default">State <Dot /></ThemedText>
              <ThemedTextInput
                placeholder="Enter state"
                value={formData.state}
                onChangeText={handleStateChange}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Zip Code <Dot /></ThemedText>
            <ThemedTextInput
              placeholder="Enter zip code"
              value={formData.zipCode}
              onChangeText={handleZipCodeChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Phone <Dot /></ThemedText>
            <ThemedTextInput
              placeholder="Enter phone"
              value={formData.phone}
              onChangeText={handlePhoneChange}
            />
          </ThemedView>

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
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
});
