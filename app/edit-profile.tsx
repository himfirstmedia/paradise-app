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

const getSafeParam = (param: any): string => {
  return Array.isArray(param) ? param[0] || "" : param || "";
};

export default function EditProfileScreen() {
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser } = useReduxAuth();
  const { houses } = useReduxHouse();
  const { reload } = useReduxMembers();

  // Extract all params as primitives
  const paramId = getSafeParam(params.id);
  const paramName = getSafeParam(params.name);
  const paramEmail = getSafeParam(params.email);
  const paramGender = getSafeParam(params.gender);
  const paramCity = getSafeParam(params.city);
  const paramState = getSafeParam(params.state);
  const paramZipCode = getSafeParam(params.zipCode);
  const paramPhone = getSafeParam(params.phone);
  const paramRole = getSafeParam(params.role);
  const paramHouseId = getSafeParam(params.houseId);
  const paramImage = getSafeParam(params.image);
  const paramJoinedDate = getSafeParam(params.joinedDate);
  const paramLeavingDate = getSafeParam(params.leavingDate);
  const paramPassword = getSafeParam(params.password);

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

  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);
  const currentUserId = currentUser?.id ?? null;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (paramId) {
      setFormData({
        id: Number(paramId),
        name: paramName,
        email: paramEmail,
        gender: paramGender,
        city: paramCity,
        state: paramState,
        zipCode: paramZipCode,
        phone: paramPhone,
        role: paramRole,
        houseId: Number(paramHouseId) || null,
        image: paramImage || null,
        joinedDate: paramJoinedDate || null,
        leavingDate: paramLeavingDate || null,
        password: paramPassword,
      });
    } else if (
      currentUser &&
      formData.id !== (currentUserId ? String(currentUserId) : null)
    ) {
      setFormData({
        id: currentUser.id ?? null,
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
        gender: currentUser.gender ?? "",
        city: currentUser.city ?? "",
        state: currentUser.state ?? "",
        zipCode: currentUser.zipCode ?? "",
        phone: currentUser.phone ?? "",
        role: currentUser.role ?? "",
        houseId: currentUser.houseId ? currentUser.houseId : null,
        image: currentUser.image ?? null,
        joinedDate: currentUser.joinedDate ?? null,
        leavingDate: currentUser.leavingDate ?? null,
        password: "",
      });
    }
  }, [
    paramId,
    paramName,
    paramEmail,
    paramGender,
    paramCity,
    paramState,
    paramZipCode,
    paramPhone,
    paramRole,
    paramHouseId,
    paramImage,
    paramJoinedDate,
    paramLeavingDate,
    paramPassword,
    currentUserId,
    formData.id,
    currentUser,
  ]);

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

      Alert.alert("Success", "Profile updated successfully!");

      await reload();
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  }, [formData, navigation, reload]);

  const houseOptions = houses.map((house) => ({
    label: house.name,
    value: house.id,
  }));

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          paddingBottom: "20%",
        }}
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemedText type="title" style={{ marginBottom: 20 }}>
            Edit Profile
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Name</ThemedText>
            <ThemedTextInput
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={handleNameChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Email Address</ThemedText>
            <ThemedEmailInput
              placeholder="Enter your email address"
              value={formData.email}
              onChangeText={handleEmailChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Gender</ThemedText>
            <ThemedDropdown
              placeholder="Select your gender"
              items={["MALE", "FEMALE"]}
              value={formData.gender}
              onValueChange={handleGenderChange}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">House</ThemedText>
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
              <ThemedText type="default">City</ThemedText>
              <ThemedTextInput
                placeholder="Enter city"
                value={formData.city}
                onChangeText={handleCityChange}
              />
            </ThemedView>
            <ThemedView style={{ width: "45%" }}>
              <ThemedText type="default">State</ThemedText>
              <ThemedTextInput
                placeholder="Enter state"
                value={formData.state}
                onChangeText={handleStateChange}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Zip Code</ThemedText>
            <ThemedTextInput
              placeholder="Enter zip code"
              value={formData.zipCode}
              onChangeText={handleZipCodeChange}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Phone</ThemedText>
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
        </KeyboardAvoidingView>
      </ScrollView>
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
