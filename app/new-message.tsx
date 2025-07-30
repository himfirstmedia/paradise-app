// screens/NewMessageScreen.tsx
import { useState } from "react";
import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ThemedCheckbox } from "@/components/ThemedInput";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useRouter } from "expo-router";

import { useThemeColor } from "@/hooks/useThemeColor";

export default function NewMessageScreen() {
  const router = useRouter();
  const { user } = useReduxAuth();
  const { houses, loading: housesLoading } = useReduxHouse();

  const [selectedHouses, setSelectedHouses] = useState<string[]>([]);
  const tintColor = useThemeColor({}, "tint");
  const [isProceeding, setIsProceeding] = useState(false);

  
  const userHouse = user?.houseId
    ? houses.filter(house => house.id === user.houseId)
    : [];

  const toggleHouse = (houseId: string) => {
    setSelectedHouses((prev) =>
      prev.includes(houseId)
        ? prev.filter((item) => item !== houseId)
        : [...prev, houseId]
    );
  };

  const handleProceed = () => {
    if (isProceeding) return;
    setIsProceeding(true);

    router.replace({
      pathname: "/chat-room",
      params: {
        houseIds: selectedHouses.join(","),
      },
    });
  };

  const totalSelected = selectedHouses.length;

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Houses Section */}
          <ThemedText type="subtitle" style={styles.sectionHeader}>
            Houses
          </ThemedText>

          {housesLoading ? (
          <ThemedText>Loading...</ThemedText>
        ) : userHouse.length > 0 ? (
          userHouse.map((house) => (
            <RecipientItem
              key={`house-${house.id}`}
              id={house.id.toString()}
              name={house.name}
              isSelected={selectedHouses.includes(house.id.toString())}
              onSelect={() => toggleHouse(house.id.toString())}
              isGroup={true}
            />
          ))
        ) : (
          <ThemedText style={styles.emptyText}>
            {user?.houseId 
              ? "Your house information is not available" 
              : "You don't belong to any house"}
          </ThemedText>
        )}

        </ScrollView>

        {/* Proceed Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={`Message Selected (${totalSelected})`}
            onPress={handleProceed}
            disabled={totalSelected === 0 || isProceeding}
            style={totalSelected > 0 ? { backgroundColor: tintColor } : {}}
          />
        </View>
      </ThemedView>
    </>
  );
}

interface RecipientItemProps {
  id: string;
  name: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isGroup?: boolean;
}

function RecipientItem({
  id,
  name,
  isSelected,
  onSelect,
  isGroup = false,
}: RecipientItemProps) {
  const inputColor = useThemeColor({}, "input");
  const bgColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  return (
    <Pressable
      style={[
        styles.recipientItem,
        { backgroundColor: isSelected ? tintColor : inputColor },
      ]}
      onPress={() => onSelect(id)}
    >
      <View style={styles.recipientContent}>
        <UserAvatar size={50} user={{ name }} />
        <View style={styles.textContainer}>
          <ThemedText type="default" style={styles.recipientName}>
            {name}
          </ThemedText>
          {isGroup && (
            <ThemedText type="defaultSemiBold" style={styles.groupBadge}>
              House
            </ThemedText>
          )}
        </View>
      </View>

      <ThemedCheckbox
        checked={isSelected}
        onChange={() => onSelect(id)}
        type="default"
        background={bgColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
  },
  recipientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  recipientContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
  },
  groupBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  buttonContainer: {
    paddingVertical: 16,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 10,
    fontStyle: "italic",
  },
});
