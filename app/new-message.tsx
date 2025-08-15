import { useState, useMemo } from "react";
import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ThemedCheckbox } from "@/components/ThemedInput";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { House } from "@/types/house";
import { User } from "@/redux/slices/userSlice";

export default function NewMessageScreen() {
  const router = useRouter();
  const { user: currentUser } = useReduxAuth();
  const { houses, loading: housesLoading } = useReduxHouse();
  const { members, loading: membersLoading } = useReduxMembers();
  const [selectedHouses, setSelectedHouses] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const tintColor = useThemeColor({}, "tint");
  const [isProceeding, setIsProceeding] = useState(false);

  const isDirector = currentUser?.role === "DIRECTOR" || currentUser?.role === "SUPER_ADMIN";

  const currentHouse = useMemo(() => {
    if (!currentUser?.houseId) return null;
    return houses.find(house => house.id === currentUser.houseId);
  }, [currentUser, houses]);


  const visibleMembers = useMemo(() => {
    if (isDirector) {
      return members.filter(member => 
        member.role === "RESIDENT" || member.role === "MANAGER"
      );
    } else if (currentHouse) {
      return members.filter(
        member => 
          member.role === "RESIDENT" && 
          member.house?.id === currentHouse.id
      );
    }
    return [];
  }, [members, isDirector, currentHouse]);

  const visibleHouses = useMemo(() => {
    if (isDirector) return houses;
    if (currentHouse) return [currentHouse];
    return [];
  }, [houses, isDirector, currentHouse]);

  const toggleHouse = (houseId: string) => {
    setSelectedHouses((prev) =>
      prev.includes(houseId)
        ? prev.filter((item) => item !== houseId)
        : [...prev, houseId]
    );
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((item) => item !== memberId)
        : [...prev, memberId]
    );
  };

  const handleProceed = () => {
    if (isProceeding || (selectedHouses.length === 0 && selectedMembers.length === 0)) return;
    setIsProceeding(true);
    
    router.replace({
      pathname: "/chat-room",
      params: {
        houseIds: selectedHouses.join(","),
        memberIds: selectedMembers.join(","),
      },
    });
  };

  const totalSelected = selectedHouses.length + selectedMembers.length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Houses Section */}
        {(isDirector || currentHouse) && (
          <>
            <ThemedText type="subtitle" style={styles.sectionHeader}>
              Houses
            </ThemedText>
            
            {housesLoading ? (
              <ThemedText>Loading houses...</ThemedText>
            ) : visibleHouses.length > 0 ? (
              visibleHouses.map((house: House) => (
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
                {isDirector
                  ? "There are no houses available"
                  : "Your house information is not available"}
              </ThemedText>
            )}
          </>
        )}

        {/* Members Section */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Members
        </ThemedText>

        {membersLoading ? (
          <ThemedText>Loading members...</ThemedText>
        ) : visibleMembers.length > 0 ? (
          visibleMembers.map((member: User) => (
            <RecipientItem
              key={`member-${member.id}`}
              id={member.id.toString()}
              name={member.name}
              isSelected={selectedMembers.includes(member.id.toString())}
              onSelect={() => toggleMember(member.id.toString())}
              isGroup={false}
            />
          ))
        ) : (
          <ThemedText style={styles.emptyText}>
            {isDirector
              ? "There are no residents or managers available"
              : currentHouse
                ? "There are no residents in your house yet"
                : "You're not assigned to a house"}
          </ThemedText>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={`Participant Selected (${totalSelected})`}
          onPress={handleProceed}
          disabled={totalSelected === 0 || isProceeding}
          style={totalSelected > 0 ? { backgroundColor: tintColor } : {}}
        />
      </View>
    </ThemedView>
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
