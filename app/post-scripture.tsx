import {
  ThemedDropdown,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const BIBLE_BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

const BIBLE_VERSIONS = [
  "KJV", // King James Version
  "NKJV", // New King James Version
  "NIV", // New International Version
  "NLT", // New Living Translation
  "ESV", // English Standard Version
  "NASB", // New American Standard Bible
  "AMP", // Amplified Bible
  "CSB", // Christian Standard Bible
];

export default function PostScriptureScreen() {
  const params = useLocalSearchParams();

  // Populate fields from params if present (for update)
  const [selectedBook, setSelectedBook] = useState(
    Array.isArray(params.book) ? params.book[0] : params.book ?? ""
  );
  const [selectedVersion, setSelectedVersion] = useState(
    Array.isArray(params.version) ? params.version[0] : params.version ?? ""
  );
  const [enteredVerse, setEnteredVerse] = useState(
    Array.isArray(params.verse) ? params.verse[0] : params.verse ?? ""
  );
  const [enteredScripture, setEnteredScripture] = useState(
    Array.isArray(params.scripture)
      ? params.scripture[0]
      : params.scripture ?? ""
  );
  const [loading, setLoading] = useState(false);

  const { reload } = useReduxScripture();
  const navigation = useRouter();
  const textColor = useThemeColor({}, "text");

  // Determine if this is an update or create
  const isUpdate = !!params.id;

  const handlePostCreation = async () => {
    setLoading(true);
    try {
      await api.post("/scriptures", {
        book: selectedBook,
        version: selectedVersion,
        verse: enteredVerse,
        scripture: enteredScripture,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Scripture created successfully!");
      setSelectedBook("");
      setSelectedVersion("");
      setEnteredVerse("");
      setEnteredScripture("");
      await reload();
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create scripture."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    setLoading(true);
    try {
      await api.put(`/scriptures/${params.id}`, {
        book: selectedBook,
        version: selectedVersion,
        verse: enteredVerse,
        scripture: enteredScripture,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Scripture updated successfully!");
      await reload();
      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update scripture."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
        >
          <View style={{ flex: 1, width: "100%" }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ThemedView style={styles.innerContainer}>
                <ThemedText
                  type="title"
                  style={{ color: textColor, marginBottom: 20 }}
                >
                  {isUpdate ? "Update Post" : "Post Scripture"}
                </ThemedText>
                <ThemedText>Book</ThemedText>
                <ThemedDropdown
                  placeholder="Select a book"
                  items={BIBLE_BOOKS}
                  value={selectedBook}
                  onSelect={setSelectedBook}
                  numColumns={3}
                  multiSelect={false}
                />

                <ThemedText>Version</ThemedText>
                <ThemedDropdown
                  placeholder="Select bible version"
                  items={BIBLE_VERSIONS}
                  value={selectedVersion}
                  onSelect={setSelectedVersion}
                  numColumns={3}
                  multiSelect={false}
                />
                <ThemedText>Verse</ThemedText>
                <ThemedTextInput
                  placeholder="Enter bible verse"
                  value={enteredVerse}
                  onChangeText={setEnteredVerse}
                />
                <ThemedText>Scripture</ThemedText>
                <ThemedTextArea
                  placeholder="Enter bible scripture"
                  value={enteredScripture}
                  onChangeText={setEnteredScripture}
                  height={200}
                />
                <Button
                  title={isUpdate ? "Update Post" : "Post Scripture"}
                  loading={loading}
                  onPress={isUpdate ? handleUpdatePost : handlePostCreation}
                />
              </ThemedView>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  innerContainer: {},
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
});
