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
  Image,
} from "react-native";
import React, { useRef, useState } from "react";
import { ThemedText } from "./ThemedText";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";

export type ThemedInputProps = TextInputProps & {
  type?: "default" | "floating" | "rounded";
  placeholder?: string;
  errorMessage?: string | null;
};

type ThemedDropdownProps = ThemedInputProps & {
  items: string[];
  value?: string;
  onSelect?: (item: string) => void;
  onValueChange?: (item: string) => void;
  placeholder?: string;
  errorMessage?: string | null;
  numColumns?: number;
  buttonStyle?: object;
};

type ThemedCheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  type?: "default" | "floating" | "rounded";
};

export function ThemedEmailInput({
  type = "default",
  placeholder,
  errorMessage,
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
          { color: textColor },
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
        ]}
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
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const textColor = useThemeColor({}, "text"); // Add text color

  return (
    <>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: bgColor, color: textColor }, // Add text color
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
        ]}
        selectionColor={useThemeColor({}, "selection")}
        placeholder={placeholder}
        placeholderTextColor={useThemeColor({}, "placeholder")}
        value={value} // Pass value prop
        onChangeText={onChangeText} // Pass onChangeText prop
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
  ...rest
}: ThemedInputProps) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");

  return (
    <>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: bgColor, height: 200, textAlignVertical: "top" },
          type === "default" ? styles.default : undefined,
          type === "floating" ? styles.floating : undefined,
          type === "rounded" ? styles.rounded : undefined,
        ]}
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
}: ThemedCheckboxProps) {
  const bgColor = useThemeColor({}, "input");
  const selectionColor = useThemeColor({}, "selection");
  const borderColor = useThemeColor({}, "border");
  const checkColor = useThemeColor({}, "selection");
  const textColor = useThemeColor({}, "text");

  return (
    <Pressable
      onPress={() => onChange && onChange(!checked)}
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
          marginTop: 15,
        },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          {
            width: 22,
            height: 22,
            borderRadius: type === "rounded" ? 11 : 6,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: checked ? selectionColor : bgColor,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 6,
          },
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
        <ThemedText type="default" style={{ color: textColor }}>
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
  onSelect,
  onValueChange,
  errorMessage,
  loading = false,
  numColumns = 1,
  buttonStyle = {},
  ...rest
}: ThemedDropdownProps & { loading?: boolean }) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const iconColor = useThemeColor({}, "placeholder");
  const placeholderColor = useThemeColor({}, "placeholder");

  const [selected, setSelected] = useState(value ?? "");
  const [showModal, setShowModal] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState<LayoutRectangle | null>(
    null
  );

  const dropdownRef = useRef<View>(null);

  // Open modal and measure dropdown position
  const handleOpen = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow((x, y, width, height) => {
        setDropdownLayout({ x, y, width, height });
        setShowModal(true);
      });
    } else {
      setShowModal(true);
    }
  };

  // Sync selected state with value prop
  React.useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  // Handle item selection
  const handleSelect = (item: string) => {
    setSelected(item);
    setShowModal(false);
    if (onSelect) onSelect(item);
    if (onValueChange) onValueChange(item);
    if (rest.onChangeText) rest.onChangeText(item);
  };

  // Render dropdown modal just below the dropdown
  const windowHeight = Dimensions.get("window").height;

  return (
    <>
      <View
        ref={dropdownRef}
        onLayout={() => {}} // Needed for ref to work
        style={{ position: "relative", width: "100%" }}
      >
        <Pressable onPress={handleOpen}>
          <View
            style={[
              styles.dropdown,
              { backgroundColor: bgColor },
              type === "default" ? styles.default : undefined,
              type === "floating" ? styles.floating : undefined,
              type === "rounded" ? styles.rounded : undefined,
              { paddingRight: 40 },
            ]}
          >
            {!selected ? (
              <ThemedText type="default" style={{ color: placeholderColor }}>
                {placeholder || "Select an option"}
              </ThemedText>
            ) : (
              <ThemedText type="default">{selected}</ThemedText>
            )}
          </View>
        </Pressable>
        <TouchableOpacity
          onPress={handleOpen}
          style={{
            position: "absolute",
            right: 10,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
          accessibilityLabel={showModal ? "Hide modal" : "Show modal"}
        >
          {showModal ? (
            <Image
              source={require("../assets/icons/chevron-up.png")}
              style={{ height: 20, width: 20, tintColor: iconColor }}
            />
          ) : (
            <Image
              source={require("../assets/icons/chevron-down.png")}
              style={{ height: 20, width: 20, tintColor: iconColor }}
            />
          )}
        </TouchableOpacity>
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
                  keyExtractor={(item) => item}
                  numColumns={numColumns} // <-- use prop
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.button,
                        buttonStyle, // <-- use prop
                        numColumns > 1 && { width: 130, marginLeft: 6 },
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <ThemedText type="default">{item}</ThemedText>
                    </Pressable>
                  )}
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
  ...rest
}: ThemedInputProps & { errorMessage?: string }) {
  const bgColor = useThemeColor({}, "input");
  const errorColor = useThemeColor({}, "overdue");
  const placeholderColor = useThemeColor({}, "placeholder");
  const textColor = useThemeColor({}, "text");

  const [date, setDate] = useState<Date | null>(value ? new Date(value) : null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage ?? null);

  const handleConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    setDate(selectedDate);
    setError(null);
    if (onChangeText) onChangeText(selectedDate.toISOString());
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  return (
    <>
      <Pressable onPress={() => setShowPicker(true)}>
        <View
          style={[
            styles.input,
            {
              backgroundColor: bgColor,
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
            },
            type === "default" ? styles.default : undefined,
            type === "floating" ? styles.floating : undefined,
            type === "rounded" ? styles.rounded : undefined,
          ]}
        >
          <ThemedText
            type="default"
            style={{ color: date ? textColor : placeholderColor }}
          >
            {date ? format(date, "dd-MM-yyyy") : placeholder}
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
    height: 50,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 15,
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
  },
  modalContent: {
    borderRadius: 12,
    paddingVertical: 5,
    minWidth: 160,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "rgba(0,0,0, 0.2)",
    alignItems: "flex-start",
  },
  icon: {
    height: 24,
    width: 24,
  },
});
