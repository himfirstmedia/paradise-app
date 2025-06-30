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
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

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
  house: string | null;
  image: string | null;
  joinedDate: string | null;
  leavingDate: string | null;
  password: string;
}

export default function EditProfileScreen() {
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser } = useReduxAuth();

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
    house: null,
    image: null,
    joinedDate: null,
    leavingDate: null,
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const getParamValue = (value: any): string => {
    return Array.isArray(value) ? value[0] || "" : value || "";
  };

  useEffect(() => {
    if (params?.id) {
      setFormData({
        id: Number(params.id),
        name: getParamValue(params.name),
        email: getParamValue(params.email),
        gender: getParamValue(params.gender),
        city: getParamValue(params.city),
        state: getParamValue(params.state),
        zipCode: getParamValue(params.zipCode),
        phone: getParamValue(params.phone),
        role: getParamValue(params.role),
        house: getParamValue(params.house) || null,
        image: getParamValue(params.image) || null,
        joinedDate: getParamValue(params.joinedDate) || null,
        leavingDate: getParamValue(params.leavingDate) || null,
        password: getParamValue(params.password),
      });
    } else if (currentUser) {
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
        house: currentUser.house ?? null,
        image: currentUser.image ?? null,
        joinedDate: currentUser.joinedDate ?? null,
        leavingDate: currentUser.leavingDate ?? null,
        password: "",
      });
    }
  }, [params, currentUser]);

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

  const handleUpdate = useCallback(async () => {
    if (!formData.id) {
      Alert.alert("Error", "User ID is missing");
      return;
    }

    setLoading(true);
    try {
      // Create a payload without password if it's empty
      const payload = { ...formData };
      if (payload.password === "") {
        const { password, ...rest } = payload;
        await api.put(`/users/${formData.id}`, rest);
      } else {
        await api.put(`/users/${formData.id}`, payload);
      }

      Alert.alert("Success", "Profile updated successfully!");
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  }, [formData, navigation]);

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
    marginBottom: 16,
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
