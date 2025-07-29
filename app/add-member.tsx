import {
  ThemedDatePicker,
  ThemedDropdown,
  ThemedEmailInput,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

const genderMap: Record<string, string> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
};

const roleMap: Record<string, string> = {
  "Super Admin": "SUPER_ADMIN",
  Admin: "ADMIN",
  Director: "DIRECTOR",
  "Resident Manager": "RESIDENT_MANAGER",
  "Facility Manager": "FACILITY_MANAGER",
  Resident: "RESIDENT",
  Individual: "INDIVIDUAL",
};

export default function AddMemberScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [houseId, setHouseId] = useState<number | null>(null);
  const [city, setCity] = useState("");
  const [leavingDate, setLeavingDate] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const { user } = useReduxAuth();
  const { reload } = useReduxMembers();
  const {
    houses,
    loading: housesLoading,
    error: housesError,
  } = useReduxHouse();
  const navigation = useRouter();

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const currentUserRole = user?.role;

  const roleOptions = ["Resident", "Individual"];
  if (currentUserRole === "DIRECTOR") {
    roleOptions.push("Facility Manager", "Resident Manager");
  }

  const houseOptions = houses.map((house) => ({
    label: house.name,
    value: house.id,
  }));

  const handleMemberCreation = async (): Promise<void> => {
    const newErrors: Record<string, string> = {};

    if (!firstname) newErrors.firstname = "firstname is required.";
    if (!lastname) newErrors.lastname = "Lastname is required.";
    if (!email) newErrors.email = "Email is required.";
    if (!phone) newErrors.phone = "Phone is required.";
    if (!gender) newErrors.gender = "Gender is required.";
    if (!selectedRole) newErrors.role = "Role is required.";
    if (selectedRole === "Resident" && !houseId)
      newErrors.house = "House is required for Resident.";
    if (!city) newErrors.city = "City is required.";
    if (!state) newErrors.state = "State is required.";
    if (!zipCode) newErrors.zipCode = "Zip Code is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const name = `${firstname.trim()} ${lastname.trim()}`;

    setLoading(true);
    try {
      await api.post("/users", {
        firstname,
        lastname,
        name,
        email,
        phone,
        gender: genderMap[gender] || gender,
        role: roleMap[selectedRole] || selectedRole,
        houseId: selectedRole === "Resident" ? houseId : undefined,
        password: name.replace(/\s+/g, "").toLowerCase(),
        joinedDate: new Date().toISOString(),
        leavingDate: leavingDate ? leavingDate : undefined,
        city,
        state,
        zipCode,
      });
      await reload();
      Alert.alert("Success", "Member created successfully!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setGender("");
      setSelectedRole("");
      setHouseId(null);
      setCity("");
      setState("");
      setZipCode("");
      setLeavingDate("");
      setErrors({});
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create member."
      );
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS === "web" && { minHeight: "100%" },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText type="title" style={{ marginBottom: 15 }}>
              New Member
            </ThemedText>

            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    First Name <Dot />{" "}
                  </ThemedText>
                  <ThemedTextInput
                    placeholder="Enter first name"
                    value={firstname}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                    }}
                    errorMessage={errors.name}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Last Name <Dot />{" "}
                  </ThemedText>
                  <ThemedTextInput
                    placeholder="Enter last name"
                    value={lastname}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                    }}
                    errorMessage={errors.name}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                Email Address <Dot />
              </ThemedText>
              <ThemedEmailInput
                placeholder="Enter email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((e) => ({ ...e, email: "" }));
                }}
                errorMessage={errors.email}
              />
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                Phone <Dot />
              </ThemedText>
              <ThemedTextInput
                placeholder="Enter phone number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
                }}
                errorMessage={errors.phone}
              />
            </ThemedView>

            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "40%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Gender <Dot />
                  </ThemedText>
                  <ThemedDropdown
                    placeholder="Select gender"
                    items={["Male", "Female"]}
                    value={gender}
                    onSelect={(val) => {
                      setGender(val);
                      if (errors.gender)
                        setErrors((e) => ({ ...e, gender: "" }));
                    }}
                    errorMessage={errors.gender}
                    multiSelect={false}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={{ width: "56%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Role <Dot />
                  </ThemedText>
                  <ThemedDropdown
                    placeholder="Select role"
                    items={roleOptions}
                    value={selectedRole}
                    onSelect={(val) => {
                      setSelectedRole(val);
                      if (errors.role) setErrors((e) => ({ ...e, role: "" }));
                    }}
                    errorMessage={errors.role}
                    multiSelect={false}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {(selectedRole === "Resident" ||
              selectedRole === "Facility Manager" ||
              selectedRole === "Resident Manager") && (
              <ThemedView style={styles.inputField}>
                <ThemedText type="default">
                  House <Dot />
                </ThemedText>
                {housesLoading ? (
                  <ThemedText>Loading houses...</ThemedText>
                ) : housesError ? (
                  <ThemedText style={{ color: "red" }}>
                    Error loading houses
                  </ThemedText>
                ) : (
                  <ThemedDropdown
                    placeholder="Select house"
                    items={houseOptions.map((h) => h.label)}
                    value={
                      houseOptions.find((h) => h.value === houseId)?.label || ""
                    }
                    onSelect={(label) => {
                      const found = houseOptions.find((h) => h.label === label);
                      setHouseId(found ? found.value : null);
                      if (errors.house) setErrors((e) => ({ ...e, house: "" }));
                    }}
                    errorMessage={errors.house}
                    multiSelect={false}
                  />
                )}
              </ThemedView>
            )}

            {selectedRole === "Individual" && (
              <ThemedView style={styles.inputField}>
                <ThemedText type="default">
                  Leaving <Dot />
                </ThemedText>
                <ThemedDatePicker
                  value={leavingDate}
                  onChangeText={(val) => {
                    setLeavingDate(val);
                    if (errors.leavingDate)
                      setErrors((e) => ({ ...e, leavingDate: "" }));
                  }}
                  errorMessage={errors.leavingDate}
                />
              </ThemedView>
            )}

            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    City <Dot />
                  </ThemedText>
                  <ThemedTextInput
                    placeholder="Enter city"
                    value={city}
                    onChangeText={(text) => {
                      setCity(text);
                      if (errors.city) setErrors((e) => ({ ...e, city: "" }));
                    }}
                    errorMessage={errors.city}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    State <Dot />
                  </ThemedText>
                  <ThemedTextInput
                    placeholder="Enter state"
                    value={state}
                    onChangeText={(text) => {
                      setState(text);
                      if (errors.state) setErrors((e) => ({ ...e, state: "" }));
                    }}
                    errorMessage={errors.state}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                Zip Code <Dot />
              </ThemedText>
              <ThemedTextInput
                placeholder="Enter zip code"
                value={zipCode}
                onChangeText={(text) => {
                  setZipCode(text);
                  if (errors.zipCode) setErrors((e) => ({ ...e, zipCode: "" }));
                }}
                errorMessage={errors.zipCode}
              />
            </ThemedView>

            <ThemedView style={{ marginTop: "5%", width: "100%" }}>
              <Button
                type="default"
                title="Add Member"
                onPress={handleMemberCreation}
                loading={loading}
              />
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  innerContainer: {
    flexGrow: 1,
    width: "100%",
    paddingTop: "5%",
    paddingHorizontal: 15,
  },
});
