// screens/EditHouseScreen.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { HouseForm, HouseFormValues } from "@/components/HouseForm";
import api from "@/utils/api";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { getStringParam } from "@/utils/Helpers";

export default function EditHouseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { reload } = useReduxHouse();
  const [houseId, setHouseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const idParam = getStringParam(params.id);
  const nameParam = getStringParam(params.name);
  const abbrevParam = getStringParam(params.abbreviation);
  const capacityParam = getStringParam(params.capacity);

  useEffect(() => {
    if (idParam) {
      setHouseId(parseInt(idParam));
    }
  }, [idParam]);

  const handleSubmit = async (values: HouseFormValues) => {
    if (!houseId) return;
    
    const { houseName, abbreviation, capacity } = values;
    const name = houseName.trim();
    const abbrev = abbreviation.trim();
    const capacityNum = Number(capacity);

    
    if (!name || !abbrev || !capacity) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert("Error", "Capacity must be a valid positive number.");
      return;
    }

    setLoading(true);
    
    try {
      await api.put(`/houses/${houseId}`, {
        name,
        abbreviation: abbrev,
        capacity: capacityNum,
      });
      Alert.alert("Success", "House updated successfully!");
      await reload();
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update house";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HouseForm
      mode="edit"
      initialValues={{
        name: nameParam,
        abbreviation: abbrevParam,
        capacity: capacityParam
      }}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}