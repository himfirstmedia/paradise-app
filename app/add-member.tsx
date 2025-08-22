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
import { House } from "@/types/house";

const genderMap: Record<string, string> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
};

const roleMap: Record<string, string> = {
  "Super Admin": "SUPER_ADMIN",
  Director: "DIRECTOR",
  Manager: "MANAGER",
  Resident: "RESIDENT",
};

const schoolStatusMap: Record<string, string> = {
  "Full Time": "FULL_TIME",
  "Part Time": "PART_TIME",
  None: "NONE",
};

const employmentStatusMap: Record<string, string> = {
  "Full Time": "FULL_TIME",
  "Part Time": "PART_TIME",
  None: "NONE",
};

export default function AddMemberScreen() {
  const errorColor = useThemeColor({}, "overdue");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string | number>("");
  const [selectedRole, setSelectedRole] = useState<string | number>("");
  const [houseId, setHouseId] = useState<number | null>(null);
  const [schoolStatus, setSchoolStatus] = useState<string | number>("");
  const [employmentStatus, setEmploymentStatus] = useState<string | number>("");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
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

  const roleOptions = ["Resident"];
  if (currentUserRole === "DIRECTOR") {
    roleOptions.push("Manager");
  }

  const houseOptions = houses.map((house: House) => ({
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
    if (!schoolStatus) newErrors.schoolStatus = "School status is required.";
    if (!employmentStatus)
      newErrors.employmentStatus = "Employment status is required.";
    if (!periodStart) newErrors.periodStart = "Start date is required.";
    if (!periodEnd) newErrors.periodEnd = "End date is required.";
    if (
      periodStart &&
      periodEnd &&
      new Date(periodEnd) < new Date(periodStart)
    ) {
      newErrors.periodEnd = "End date cannot be before start date.";
    }

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
        schoolStatus: schoolStatusMap[schoolStatus] || schoolStatus,
        employmentStatus:
          employmentStatusMap[employmentStatus] || employmentStatus,
        periodStart: periodStart ? new Date(periodStart).toISOString() : null,
        periodEnd: periodEnd ? new Date(periodEnd).toISOString() : null,
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
      setSchoolStatus("");
      setEmploymentStatus("");
      setPeriodStart("");
      setPeriodEnd("");
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
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
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
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Gender <Dot />
                  </ThemedText>
                  <ThemedDropdown
                    placeholder="Select gender"
                    items={["Male", "Female"].map((opt) => ({
                      label: opt,
                      value: opt,
                    }))}
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
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Role <Dot />
                  </ThemedText>
                  <ThemedDropdown
                    placeholder="Select role"
                    items={roleOptions.map((opt) => ({
                      label: opt,
                      value: opt,
                    }))}
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

            {(selectedRole === "Resident" || selectedRole === "Manager") && (
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
                    items={houseOptions}
                    value={
                      houseOptions.find(
                        (h: { value: number }) => h.value === houseId
                      )?.label || ""
                    }
                    onSelect={(label) => {
                      const found = houseOptions.find(
                        (h: { label: string }) => h.label === label
                      );
                      setHouseId(found ? found.value : null);
                      if (errors.house) setErrors((e) => ({ ...e, house: "" }));
                    }}
                    errorMessage={errors.house}
                    multiSelect={false}
                  />
                )}
              </ThemedView>
            )}

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                School Status <Dot />
              </ThemedText>
              <ThemedDropdown
                placeholder="Select status"
                items={["Full Time", "Part Time", "None"].map((opt) => ({
                  label: opt,
                  value: opt,
                }))}
                value={schoolStatus}
                onSelect={(val) => {
                  setSchoolStatus(val);
                  if (errors.schoolStatus)
                    setErrors((e) => ({ ...e, schoolStatus: "" }));
                }}
                errorMessage={errors.schoolStatus}
                multiSelect={false}
              />
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                Employment <Dot />
              </ThemedText>
              <ThemedDropdown
                placeholder="Select status"
                items={["Full Time", "Part Time", "None"].map((opt) => ({
                  label: opt,
                  value: opt,
                }))}
                value={employmentStatus}
                onSelect={(val) => {
                  setEmploymentStatus(val);
                  if (errors.employmentStatus)
                    setErrors((e) => ({ ...e, employmentStatus: "" }));
                }}
                errorMessage={errors.employmentStatus}
                multiSelect={false}
              />
            </ThemedView>

            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Period Start <Dot />{" "}
                  </ThemedText>
                  <ThemedDatePicker
                    placeholder="Select start date"
                    value={periodStart}
                    onChangeText={(text) => {
                      setPeriodStart(text);
                      if (errors.periodStart)
                        setErrors((e) => ({ ...e, periodStart: "" }));
                    }}
                    errorMessage={errors.periodStart}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">
                    Period End <Dot />{" "}
                  </ThemedText>
                  <ThemedDatePicker
                    placeholder="Select end date"
                    value={periodEnd}
                    onChangeText={(text) => {
                      setPeriodEnd(text);
                      if (errors.periodEnd)
                        setErrors((e) => ({ ...e, periodEnd: "" }));
                    }}
                    errorMessage={errors.periodEnd}
                  />
                </ThemedView>
              </ThemedView>
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
    paddingHorizontal: 12,
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
  },
});
