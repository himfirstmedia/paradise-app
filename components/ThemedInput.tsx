import { useThemeColor } from "@/hooks/useThemeColor";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Pressable,
  TouchableOpacity,
  Modal,
  FlatList,
  LayoutRectangle,
  Dimensions,
  Image as RNImage,
  ViewStyle,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ThemedText } from "./ThemedText";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { Button } from "./ui/Button";
import { CameraView } from "expo-camera";
import { Image } from "expo-image";

import * as MediaLibrary from "expo-media-library";
import { ThemedView } from "./ThemedView";
import api from "@/utils/api";

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export type ThemedInputProps = TextInputProps & {
  type?: "default" | "floating" | "rounded";
  placeholder?: string;
  errorMessage?: string | null;
  background?: string;
  height?: number;
  onSendImage?: (image: string) => void;
  disabled?: boolean;
};

type ThemedDropdownProps = {
  type?: "default" | "floating" | "rounded";
  placeholder?: string;
  items?: { label: string; value: string | number }[];
  value?: string | number | (string | number)[];
  multiSelect?: boolean;
  onSelect?: (item: string | number) => void;
  onValueChange?: (value: string | number | (string | number)[]) => void;
  onChangeText?: (value: string) => void;
  errorMessage?: string;
  loading?: boolean;
  numColumns?: number;
  buttonStyle?: ViewStyle;
  disabled?: boolean;
};

type ThemedCheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  type?: "default" | "floating" | "rounded";
  style?: ViewStyle;
  background?: string;
  disabled?: boolean;
};

type ThemedTimePickerProps = {
  type?: "default" | "floating" | "rounded";
  placeholder?: string;
  value?: string;
  onChangeText?: (time: string) => void;
  errorMessage?: string;
  background?: string;
  disabled?: boolean;
};

export function ThemedEmailInput({
  type = "default",
  placeholder,
  errorMessage,
  disabled = false,
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const errorColor = useThemeColor({}, "overdue");

  return (
    <>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: bgColor },
          disabled && styles.disabled,
          { color: textColor },
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
        ]}
        editable={!disabled}
        keyboardType="email-address"
        selectionColor={useThemeColor({}, "selection")}
        placeholder={placeholder}
        autoCapitalize="none"
        placeholderTextColor={useThemeColor({}, "placeholder")}
        {...rest}
      />
      <View style={{ height: 20, justifyContent: "center" }}>
        {errorMessage && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>
              {errorMessage}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export function ThemedTextInput({
  type = "default",
  placeholder,
  errorMessage,
  value, // Add value prop
  onChangeText, // Add onChangeText prop
  disabled = false,
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const textColor = useThemeColor({}, "text");

  return (
    <>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: bgColor, color: textColor },
          disabled && styles.disabled,
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
        ]}
        editable={!disabled}
        selectionColor={useThemeColor({}, "selection")}
        placeholder={placeholder}
        placeholderTextColor={useThemeColor({}, "placeholder")}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      <View style={{ height: 20, justifyContent: "center" }}>
        {errorMessage && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>
              {errorMessage}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export function ThemedTextArea({
  type = "default",
  placeholder,
  errorMessage,
  background,
  height,
  disabled = false,
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const textColor = useThemeColor({}, "text");

  return (
    <>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: background === undefined ? bgColor : background,
            height: height === null ? 200 : height,
            textAlignVertical: "top",
            color: textColor,
            fontSize: 16,
          },
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
          disabled && styles.disabled,
        ]}
        editable={!disabled}
        selectionColor={useThemeColor({}, "selection")}
        placeholder={placeholder}
        placeholderTextColor={useThemeColor({}, "placeholder")}
        multiline
        {...rest}
      />
      <View style={{ height: 20, justifyContent: "center" }}>
        {errorMessage && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>
              {errorMessage}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export function ThemedCheckbox({
  checked = false,
  onChange,
  label,
  type = "default",
  style,
  background,
  disabled = false,
}: ThemedCheckboxProps) {
  const bgColor = useThemeColor({}, "input");
  const selectionColor = useThemeColor({}, "selection");
  const borderColor = useThemeColor({}, "border");
  const checkColor = useThemeColor({}, "selection");
  const textColor = useThemeColor({}, "text");

  return (
    <Pressable
      onPress={() => !disabled && onChange && onChange(!checked)}
      disabled={disabled}
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
        },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          style,
          {
            width: 22,
            height: 22,
            borderRadius: type === "rounded" ? 11 : 6,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: checked
              ? selectionColor
              : background === undefined
              ? bgColor
              : background,
            justifyContent: "center",
            alignItems: "center",
          },
          disabled && styles.disabled,
          type === "floating" && { elevation: 2, shadowColor: "#000" },
        ]}
      >
        {checked && (
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: type === "rounded" ? 6 : 2,
              backgroundColor: checkColor,
              justifyContent: "center",
              alignItems: "center",
              // flexDirection: 'column'
            }}
          >
            <Image
              source={require("../assets/icons/check.png")}
              style={{ height: 16, width: 16, tintColor: "#fff" }}
            />
          </View>
        )}
      </View>
      {label ? (
        <ThemedText
          type="default"
          style={{ color: textColor, flex: 1, textOverflow: "wrap" }}
        >
          {label}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export function ThemedDropdown({
  type = "default",
  placeholder,
  items = [],
  value,
  multiSelect,
  onSelect,
  onValueChange,
  onChangeText,
  errorMessage,
  loading = false,
  numColumns = 1,
  buttonStyle = {},
  disabled = false,
  ...rest
}: ThemedDropdownProps & { loading?: boolean }) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const errorColor = useThemeColor({}, "overdue");
  const iconColor = useThemeColor({}, "placeholder");
  const placeholderColor = useThemeColor({}, "placeholder");

  const isMulti = multiSelect === true;

  // Convert initial value to string array for internal state
  const initialValues = Array.isArray(value)
    ? value.filter((v) => v !== null && v !== undefined).map((v) => String(v))
    : value !== null && value !== undefined
    ? [String(value)]
    : [];

  const [selectedItems, setSelectedItems] = useState<string[]>(initialValues);
  const [showModal, setShowModal] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState<LayoutRectangle | null>(
    null
  );

  const dropdownRef = useRef<View>(null);

  const handleOpen = () => {
    if (disabled) return;
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow((x, y, width, height) => {
        setDropdownLayout({ x, y, width, height });
        setShowModal(true);
      });
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    // Convert external value to string array for internal state
    if (Array.isArray(value)) {
      const stringValues = value
        .filter((v) => v !== null && v !== undefined && v !== "")
        .map((v) => String(v));
      setSelectedItems(stringValues);
    } else if (value !== null && value !== undefined && value !== "") {
      setSelectedItems([String(value)]);
    } else {
      setSelectedItems([]);
    }
  }, [value]);

  const handleSelect = (itemValue: string | number) => {
    const stringValue = String(itemValue);

    if (isMulti) {
      setSelectedItems((prev) => {
        const updated = prev.includes(stringValue)
          ? prev.filter((i) => i !== stringValue)
          : [...prev, stringValue];

        // Convert back to original type for callback
        const originalTypeValues = updated.map((v) => {
          // Try to preserve number type if possible
          const num = Number(v);
          return isNaN(num) ? v : num;
        });

        onValueChange?.(originalTypeValues);
        onSelect?.(itemValue);
        if (onChangeText) onChangeText(updated.join(", "));
        return updated;
      });
    } else {
      setSelectedItems([stringValue]);

      // Convert back to original type for callback
      const originalValue = (() => {
        const num = Number(itemValue);
        return isNaN(num) ? itemValue : num;
      })();

      onValueChange?.(originalValue);
      onSelect?.(originalValue);
      if (onChangeText) onChangeText(String(itemValue));
      setShowModal(false);
    }
  };

  const getLabelForValue = (val: string) => {
    const found = items.find((i) => String(i.value) === val);
    return found ? found.label : val;
  };

  const windowHeight = Dimensions.get("window").height;

  return (
    <>
      <View ref={dropdownRef} onLayout={() => {}} style={{ width: "100%" }}>
        <Pressable onPress={handleOpen}>
          <View
            style={[
              styles.dropdown,
              { backgroundColor: bgColor },
              disabled && styles.disabled,
            ]}
          >
            <View style={styles.dropdownTopRow}>
              <View style={styles.tagsContainerWrapper}>
                {selectedItems.length === 0 || selectedItems[0] === "" ? (
                  <ThemedText
                    type="default"
                    style={{ color: placeholderColor }}
                  >
                    {placeholder || "Select an option"}
                  </ThemedText>
                ) : isMulti ? (
                  selectedItems.map((item) => {
                    if (!item || item.trim() === "") return null;
                    return (
                      <ThemedView
                        key={item}
                        style={[styles.tag, { backgroundColor }]}
                      >
                        <ThemedText
                          type="default"
                          style={{ marginRight: 4, color: textColor }}
                        >
                          {getLabelForValue(item)}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            setSelectedItems((prev) => {
                              const updated = prev.filter((i) => i !== item);
                              const originalTypeValues = updated.map((v) => {
                                const num = Number(v);
                                return isNaN(num) ? v : num;
                              });
                              onValueChange?.(originalTypeValues);
                              if (onChangeText)
                                onChangeText(updated.join(", "));
                              return updated;
                            });
                          }}
                        >
                          <Image
                            source={require("@/assets/icons/dismiss.png")}
                            style={styles.removeIcon}
                          />
                        </TouchableOpacity>
                      </ThemedView>
                    );
                  })
                ) : (
                  <ThemedText type="default" style={{ color: textColor }}>
                    {getLabelForValue(selectedItems[0])}
                  </ThemedText>
                )}
              </View>
              <View style={styles.chevronContainer}>
                <Image
                  source={
                    showModal
                      ? require("../assets/icons/chevron-up.png")
                      : require("../assets/icons/chevron-down.png")
                  }
                  style={{
                    height: 20,
                    width: 20,
                    tintColor: iconColor,
                    marginTop: "20%",
                  }}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={{ height: 20, justifyContent: "center" }}>
        {errorMessage && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>
              {errorMessage}
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setShowModal(false)}
        >
          {dropdownLayout && (
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: bgColor,
                  position: "absolute",
                  left: dropdownLayout.x,
                  top:
                    dropdownLayout.y + dropdownLayout.height + 2 >
                    windowHeight - 200
                      ? windowHeight - 200
                      : dropdownLayout.y + dropdownLayout.height + 2,
                  width: dropdownLayout.width,
                  zIndex: 1000,
                  elevation: 2,
                  shadowColor: "#222",
                },
              ]}
            >
              {loading ? (
                <View
                  style={{ padding: 20, alignItems: "center", width: "100%" }}
                >
                  <Text style={{ color: placeholderColor }}>Loading...</Text>
                </View>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={(item) => String(item.value)}
                  numColumns={numColumns}
                  style={{ flex: 1, width: "100%" }}
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item, index }) => {
                    const gap = 4;
                    const horizontalPadding = 20;
                    const itemWidth = dropdownLayout
                      ? (dropdownLayout.width -
                          horizontalPadding -
                          gap * (numColumns - 1)) /
                        numColumns
                      : 130;
                    const isLastInRow = index % numColumns === numColumns - 1;
                    return (
                      <Pressable
                        style={[
                          styles.button,
                          buttonStyle,
                          numColumns > 1 && {
                            width: itemWidth,
                            marginRight: isLastInRow ? 0 : gap,
                            marginBottom: gap,
                          },
                          numColumns === 1 && { width: "100%" },
                        ]}
                        onPress={() => handleSelect(item.value)}
                      >
                        <ThemedText type="default">{item.label}</ThemedText>
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

export function ThemedDatePicker({
  type = "default",
  placeholder = "Select date",
  value,
  onChangeText,
  errorMessage,
  background,
  disabled = false,
  ...rest
}: ThemedInputProps & { errorMessage?: string }) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const placeholderColor = useThemeColor({}, "placeholder");
  const textColor = useThemeColor({}, "text");

  const [date, setDate] = useState<Date | null>(value ? new Date(value) : null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage ?? null);

  const parsedValue = value ? new Date(value) : null;

  const handleConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    setDate(selectedDate);
    setError(null);
    // Send ISO string back to parent
    if (onChangeText) onChangeText(selectedDate.toISOString());
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handlePress = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  return (
    <>
      <Pressable onPress={handlePress} disabled={disabled}>
        <View
          style={[
            styles.input,
            {
              backgroundColor: background === undefined ? bgColor : background,
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            },
            disabled && styles.disabled,
            type === "default" ? styles.default : undefined,
            type === "floating" ? styles.floating : undefined,
            type === "rounded" ? styles.rounded : undefined,
          ]}
        >
          <ThemedText
            type="default"
            style={{ color: parsedValue ? textColor : placeholderColor }}
          >
            {parsedValue ? format(parsedValue, "MM-dd-yyyy") : placeholder}
          </ThemedText>
          <Image
            source={require("@/assets/icons/date.png")}
            style={styles.icon}
          />
        </View>
      </Pressable>
      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        date={date || new Date()}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <View style={{ height: 20, justifyContent: "center" }}>
        {(error || errorMessage) && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>
              {error || errorMessage}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export function ThemedTimePicker({
  type = "default",
  placeholder = "Select time",
  value,
  onChangeText,
  errorMessage,
  background,
  disabled = false,
}: ThemedTimePickerProps) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const placeholderColor = useThemeColor({}, "placeholder");
  const textColor = useThemeColor({}, "text");

  const [time, setTime] = useState<Date | null>(value ? new Date(value) : null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage ?? null);

  const handleConfirm = (selectedTime: Date) => {
    setShowPicker(false);
    setTime(selectedTime);
    setError(null);
    if (onChangeText) onChangeText(selectedTime.toISOString());
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handlePress = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  return (
    <>
      <Pressable onPress={handlePress} disabled={disabled}>
        <View
          style={[
            styles.input,
            {
              backgroundColor: background === undefined ? bgColor : background,
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            },
            disabled && styles.disabled,
            type === "default" ? styles.default : undefined,
            type === "floating" ? styles.floating : undefined,
            type === "rounded" ? styles.rounded : undefined,
          ]}
        >
          <ThemedText
            type="default"
            style={{ color: time ? textColor : placeholderColor }}
          >
            {time ? format(time, "HH:mm") : placeholder}
          </ThemedText>
          <Image
            source={require("@/assets/icons/time.png")}
            style={styles.icon}
          />
        </View>
      </Pressable>

      <DateTimePickerModal
        isVisible={showPicker}
        mode="time"
        date={time || new Date()}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <View style={{ height: 20, justifyContent: "center" }}>
        {(error || errorMessage) && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={[styles.dot, { backgroundColor: errorColor }]} />
            <Text style={[styles.error, { color: errorColor }]}>
              {error || errorMessage}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export function ThemedChatInput({
  type = "default",
  placeholder,
  value,
  onChangeText,
  onSendImage,
  disabled = false,
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "placeholder");

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [inputHeight, setInputHeight] = useState(50);

  const takePicture = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setCapturedImage(photo.uri);
        setCameraVisible(false);
        setPreviewVisible(true);
      } catch (error) {
        Alert.alert("Error", "Failed to capture image");
        console.error(error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleSendImage = async () => {
    if (capturedImage && onSendImage) {
      try {
        const formData = new FormData();
        const file: ImageFile = {
          uri: capturedImage,
          name: `image-${Date.now()}.jpg`,
          type: "image/jpeg",
        };
        formData.append("image", file as any);

        const response = await api.post("/chats/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { imageUrl } = response.data;
        onSendImage(imageUrl);
        setCapturedImage(null);
        setPreviewVisible(false);
      } catch (error: any) {
        console.error(
          "Failed to send image:",
          error.response?.data || error.message
        );
        Alert.alert(
          "Error",
          `Failed to send image: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }
  };

  const handleCancelImage = () => {
    setCapturedImage(null);
    setPreviewVisible(false);
  };

  return (
    <>
      <View
        style={[
          {
            width: "100%",
            flexDirection: "row",
            alignItems: inputHeight ? "center" : "flex-start",
            height: inputHeight,
            backgroundColor: bgColor,
            minHeight: 50,
          },
          disabled && styles.disabled,
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              height: inputHeight,
              paddingRight: 60,
              textAlignVertical: "top",
              fontSize: 18,
            },
          ]}
          editable={!disabled}
          autoCapitalize="sentences"
          autoCorrect={true}
          multiline
          selectionColor={useThemeColor({}, "selection")}
          placeholder={placeholder}
          placeholderTextColor={useThemeColor({}, "placeholder")}
          value={value}
          onChangeText={onChangeText}
          onContentSizeChange={(e) => {
            const newHeight = e.nativeEvent.contentSize.height;
            setInputHeight(Math.max(50, Math.min(newHeight, 120)));
          }}
          {...rest}
        />

        <Pressable
          style={{
            position: "absolute",
            right: 10,
            top: 0,
            bottom: 10,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onPress={() => !disabled && setCameraVisible(true)}
          disabled={disabled}
        >
          <RNImage
            source={require("../assets/icons/camera.png")}
            style={{ height: 24, width: 24, tintColor: iconColor }}
          />
        </Pressable>
      </View>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          />

          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 30,
            }}
          >
            <Button
              type="icon-default"
              icon={require("@/assets/icons/dismiss.png")}
              onPress={() => setCameraVisible(false)}
            />
            <Button
              type="icon-default"
              icon={require("@/assets/icons/camera.png")}
              style={{ height: 80, width: 80 }}
              iconStyle={{ height: 40, width: 40 }}
              onPress={takePicture}
            />
            <Button
              type="icon-default"
              icon={require("@/assets/icons/camera-flip.png")}
              onPress={toggleCameraFacing}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={previewVisible} animationType="fade">
        <View style={styles.previewContainer}>
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              contentFit="cover"
            />
          )}
          <View style={styles.previewButtons}>
            <Button
              type="icon-default"
              icon={require("@/assets/icons/dismiss.png")}
              onPress={handleCancelImage}
            />
            <Button
              type="icon-default"
              icon={require("@/assets/icons/send.png")}
              onPress={handleSendImage}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  dropdown: {
    width: "100%",
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  dropdownTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "nowrap",
  },

  tagsContainerWrapper: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  default: {
    minWidth: "100%",
    borderRadius: 10,
  },
  floating: {},
  rounded: {},
  dot: {
    height: 5,
    width: 5,
    borderRadius: 10,
  },
  error: {},
  button: {
    paddingVertical: 10,
    width: "100%",
    paddingHorizontal: 10,
    borderRadius: 4,
  },

  modalContent: {
    minWidth: 160,
    paddingVertical: 5,
    maxHeight: 200,
    borderRadius: 12,
    padding: 10,
    shadowColor: "rgba(0,0,0, 0.2)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: "flex-start",
  },
  icon: {
    height: 24,
    width: 24,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewImage: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
    marginBottom: 20,
  },
  previewButtons: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    bottom: 20,
    width: "100%",
    gap: 20,
    // borderWidth: 1,
    // borderColor: "#fff"
  },
  removeIcon: {
    width: 14,
    height: 14,
    tintColor: "#888",
  },
  hasTags: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    flex: 1,
    alignItems: "center",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
  },
  chevronContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  disabled: {
    opacity: 0.5,
  },
});
