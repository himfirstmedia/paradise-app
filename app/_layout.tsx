import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import RootLayout from "@/components/RootLayout";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/Colors";

export default function AppLayout() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors[colorScheme].background,
              }}
            >
              <ActivityIndicator
                size="large"
                color={Colors[colorScheme].tint}
              />
            </View>
          </ThemeProvider>
        }
        persistor={persistor}
      >
        <RootLayout />
      </PersistGate>
    </Provider>
  );
}
