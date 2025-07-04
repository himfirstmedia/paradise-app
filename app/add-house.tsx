// screens/AddHouseScreen.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { HouseForm, HouseFormValues } from "@/components/HouseForm";
import api from "@/utils/api";
import { useReduxHouse } from "@/hooks/useReduxHouse";

export default function AddHouseScreen() {
  const router = useRouter();
  const { reload } = useReduxHouse();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: HouseFormValues) => {
    const name = values.houseName.trim();
    const abbrev = values.abbreviation.trim();
    const capacityStr = values.capacity.trim();
    const capacityNum = Number(capacityStr);

    if (!name || !abbrev || !capacityStr) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert("Error", "Capacity must be a valid positive number.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/houses", {
        name, // <-- backend expects this key
        abbreviation: abbrev,
        capacity: capacityNum,
      });
      Alert.alert("Success", "House created successfully!");
      await reload();
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create house";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HouseForm
      mode="add"
      initialValues={{ houseName: "", abbreviation: "", capacity: "" }}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
