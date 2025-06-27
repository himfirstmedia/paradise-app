import { ThemedDropdown, ThemedEmailInput, ThemedTextInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import api from "@/utils/api";
import { UserSessionUtils } from "@/utils/UserSessionUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

export default function EditProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [house, setHouse] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  const [leavingDate, setLeavingDate] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState<number | null>(null);

  const navigation = useRouter();

  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      // If params has an id, use params for member info, else use current user
      if (params?.id) {
        setId(Number(params.id));
        setName(Array.isArray(params.name) ? params.name[0] : params.name ?? "");
        setEmail(Array.isArray(params.email) ? params.email[0] : params.email ?? "");
        setGender(Array.isArray(params.gender) ? params.gender[0] : params.gender ?? "");
        setCity(Array.isArray(params.city) ? params.city[0] : params.city ?? "");
        setState(Array.isArray(params.state) ? params.state[0] : params.state ?? "");
        setZipCode(Array.isArray(params.zipCode) ? params.zipCode[0] : params.zipCode ?? "");
        setPhone(Array.isArray(params.phone) ? params.phone[0] : params.phone ?? "");
        setRole(Array.isArray(params.role) ? params.role[0] : params.role ?? "");
        setHouse(Array.isArray(params.house) ? params.house[0] : params.house ?? null);
        setImage(Array.isArray(params.image) ? params.image[0] : params.image ?? null);
        setJoinedDate(Array.isArray(params.joinedDate) ? params.joinedDate[0] : params.joinedDate ?? null);
        setLeavingDate(Array.isArray(params.leavingDate) ? params.leavingDate[0] : params.leavingDate ?? null);
        setPassword(Array.isArray(params.password) ? params.password[0] : params.password ?? "");
      } else {
        const user = await UserSessionUtils.getUserDetails();
        if (user) {
          setId(user.id ?? null);
          setName(user.name ?? "");
          setEmail(user.email ?? "");
          setGender(user.gender ?? "");
          setCity(user.city ?? "");
          setState(user.state ?? "");
          setZipCode(user.zipCode ?? "");
          setPhone(user.phone ?? "");
          setRole(user.role ?? "");
          setHouse(user.house ?? null);
          setImage(user.image ?? null);
          setJoinedDate(user.joinedDate ?? null);
          setLeavingDate(user.leavingDate ?? null);
          setPassword(user.password ?? "");
        }
      }
    })();
  }, [params]);

  // Handle update
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${id}`, {
        name,
        email,
        gender,
        city,
        state,
        zipCode,
        phone,
        role,
        house,
        image,
        joinedDate,
        leavingDate,
        password,
      });
      await UserSessionUtils.setUserDetails({
        id: id!,
        name,
        email,
        gender,
        city,
        state,
        zipCode,
        phone,
        role,
        house,
        image,
        joinedDate,
        leavingDate,
        password,
        feedback: [], // Add if you have feedback data
        task: [],     // Add if you have task data
      });
      Alert.alert("Success", "Profile updated successfully!");
      navigation.back();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemedText type="title" style={{ marginBottom: "10%" }}>
            Edit Profile
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Name</ThemedText>
            <ThemedTextInput
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Email Address</ThemedText>
            <ThemedEmailInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Gender</ThemedText>
            <ThemedDropdown
              placeholder="Select your gender"
              items={["MALE", "FEMALE"]}
              value={gender}
              onValueChange={setGender}
            />
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedView style={{ width: "45%" }}>
              <ThemedText type="default">City</ThemedText>
              <ThemedTextInput
                placeholder="Enter city"
                value={city}
                onChangeText={setCity}
              />
            </ThemedView>
            <ThemedView style={{ width: "45%" }}>
              <ThemedText type="default">State</ThemedText>
              <ThemedTextInput
                placeholder="Enter state"
                value={state}
                onChangeText={setState}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Zip Code</ThemedText>
            <ThemedTextInput
              placeholder="Enter zip code"
              value={zipCode}
              onChangeText={setZipCode}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Phone</ThemedText>
            <ThemedTextInput
              placeholder="Enter phone"
              value={phone}
              onChangeText={setPhone}
            />
          </ThemedView>
          {/* Add more fields as needed, e.g. house, image, etc. */}

          <ThemedView style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Update Profile"
              onPress={handleUpdate}
              loading={loading}
            />
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: "5%",
    paddingHorizontal: 15,
  },
  inputField: {
    width: "100%",
    marginBottom: 10,
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }
})