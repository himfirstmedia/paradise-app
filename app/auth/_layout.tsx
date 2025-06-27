import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SimpleHeader } from "@/components/SimpleHeader";
import { View, StatusBar } from "react-native";

export default function AuthLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const bgColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <View
        style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      >
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={Colors[colorScheme].selection}
        />
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen
              name="signup"
              options={{
                headerShown: true,
                header: () => <SimpleHeader title="Create Account" />,
              }}
            />
            <Stack.Screen
              name="forgot_password"
              options={{ headerShown: false }}
            />
          </Stack>
        </ThemeProvider>
      </View>
    </SafeAreaView>
  );
}
