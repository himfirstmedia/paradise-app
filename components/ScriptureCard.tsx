import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type ScriptureCardProps = {
  verse: string;
  version: string;
  scripture: string;
  book: string;
  imageSource?: any;
  iconSource?: any;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// iPhone 16 has a 6.1" screen with higher resolution
const isLargeScreen = screenWidth >= 393; // iPhone 16 width
const isExtraLargeScreen = screenWidth >= 430; // iPhone 16 Plus/Pro Max

export function ScriptureCard({
  verse,
  scripture,
  version,
  book,
  imageSource = require("../assets/icons/sun.png"),
  iconSource = require("../assets/icons/sun.png"),
}: ScriptureCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const textColor = useThemeColor({}, "text");
  const backBtnColor = useThemeColor({}, "input");

  const isIOS = Platform.OS === "ios";

  // Responsive sizing
  const getResponsiveSize = () => {
    if (isExtraLargeScreen) {
      return {
        iconSize: 48,
        cardPadding: 24,
        gap: 18,
        borderRadius: 24,
        closeButtonSize: 28,
        modalPadding: 32,
      };
    } else if (isLargeScreen) {
      return {
        iconSize: 44,
        cardPadding: 22,
        gap: 16,
        borderRadius: 22,
        closeButtonSize: 26,
        modalPadding: 28,
      };
    } else {
      return {
        iconSize: 40,
        cardPadding: 20,
        gap: 15,
        borderRadius: 20,
        closeButtonSize: 24,
        modalPadding: 25,
      };
    }
  };

  const responsiveSize = getResponsiveSize();

  const cardContent = (
    <>
      <View style={[styles.row, { gap: responsiveSize.gap }]}>
        <Image
          source={iconSource}
          style={{
            width: responsiveSize.iconSize,
            height: responsiveSize.iconSize,
            tintColor: textColor,
          }}
        />

        <View style={{ flexDirection: "column", flex: 1 }}>
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.verseOfDay,
              {
                opacity: 0.8,
                color: textColor,
                fontSize: isLargeScreen ? 14 : 13,
              }
            ]}
          >
            VERSE OF THE DAY
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.verseReference,
              {
                color: textColor,
                fontSize: isExtraLargeScreen ? 18 : isLargeScreen ? 17 : 16,
              }
            ]}
          >
            {book} {verse} {version}
          </ThemedText>
        </View>
      </View>
      {modalVisible ? (
        <ThemedText 
          type="title" 
          style={[
            styles.scriptureText,
            { 
              color: textColor,
              fontSize: isExtraLargeScreen ? 28 : isLargeScreen ? 26 : 24,
              lineHeight: isExtraLargeScreen ? 36 : isLargeScreen ? 34 : 32,
            }
          ]}
        >
          {scripture}
        </ThemedText>
      ) : (
        <ThemedText
          type="default"
          numberOfLines={2}
          style={[
            styles.scripturePreview,
            { 
              color: textColor,
              fontSize: isExtraLargeScreen ? 17 : isLargeScreen ? 16 : 15,
              lineHeight: isExtraLargeScreen ? 24 : isLargeScreen ? 23 : 22,
            }
          ]}
        >
          {scripture}
        </ThemedText>
      )}
    </>
  );

  const IOSStyles = StyleSheet.create({
    verticalPadding: {
      paddingVertical: isIOS ? (isLargeScreen ? 120 : 100) : (isLargeScreen ? 50 : 40),
    }
  });

  const responsiveStyles = StyleSheet.create({
    card: {
      minHeight: isExtraLargeScreen ? "22%" : isLargeScreen ? "21%" : "20%",
      maxHeight: isExtraLargeScreen ? 230 : isLargeScreen ? 165 : 150,
      borderRadius: responsiveSize.borderRadius,
    },
    innerCard: {
      paddingVertical: isLargeScreen ? 12 : 10,
      paddingHorizontal: responsiveSize.cardPadding,
      gap: isLargeScreen ? 10 : 8,
    },
    modalContent: {
      padding: responsiveSize.modalPadding,
    },
    modalInnerCard: {
      gap: isExtraLargeScreen ? 20 : isLargeScreen ? 18 : 16,
      marginBottom: isLargeScreen ? "25%" : "30%",
    },
    closeButton: {
      marginBottom: isLargeScreen ? 12 : 10,
      padding: isLargeScreen ? 10 : 8,
    },
  });

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.card, responsiveStyles.card, { borderColor: textColor }]}>
          <View style={[styles.innerCard, responsiveStyles.innerCard]}>{cardContent}</View>
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay]}>
          <ThemedView style={[styles.modalContent, responsiveStyles.modalContent, IOSStyles.verticalPadding]}>
            <Pressable
              style={[
                styles.closeButton,
                responsiveStyles.closeButton,
                { backgroundColor: modalVisible ? backBtnColor : "#FFFFFF" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Image
                source={require("../assets/icons/dismiss.png")}
                style={{ 
                  height: responsiveSize.closeButtonSize, 
                  width: responsiveSize.closeButtonSize 
                }}
              />
            </Pressable>

            <ThemedView style={[styles.modalInnerCard, responsiveStyles.modalInnerCard]}>{cardContent}</ThemedView>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderWidth: 1,
    paddingVertical: 10
  },
  innerCard: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  verseOfDay: {
    letterSpacing: 0.5,
  },
  verseReference: {
    marginTop: 2,
  },
  scriptureText: {
    textAlign: "left",
  },
  scripturePreview: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  modalInnerCard: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  closeButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
  },
});