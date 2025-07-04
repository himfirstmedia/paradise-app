
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { HouseForm, HouseFormValues } from "@/components/HouseForm";
import api from "@/utils/api";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { getStringParam } from "@/utils/Helpers";

export default function EditHouseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { loading, reload } = useReduxHouse();

  const houseId = params.id ? parseInt(params.id as string) : null;

  const handleSubmit = async (values: HouseFormValues) => {
    if (!houseId) return;

    
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
    }
  };

  return (
    <HouseForm
      mode="edit"
      initialValues={{
        houseName: getStringParam(params.name),
        abbreviation: getStringParam(params.abbreviation),
        capacity: getStringParam(params.capacity),
      }}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
}
