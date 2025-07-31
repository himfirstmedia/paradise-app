import "dotenv/config";

export default {
  expo: {
    name: "Paradise",
    slug: "Paradise-App",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/adaptive-icon.png",
    scheme: "paradiseapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.himfirstapps.ParadiseApp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      permissions: ["INTERNET", "NOTIFICATIONS"],
      icon: {
        dark: "./assets/images/ios-dark.png",
        light: "./assets/images/ios-light.png",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.himfirstapps.ParadiseApp",
      permissions: [
        "INTERNET",
        "NOTIFICATIONS",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "FOREGROUND_SERVICE",
      ],
      googleServicesFile:
        "./paradise-app-7af9e-firebase-adminsdk-fbsvc-4b7eadb276.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon-light.png",
          imageWidth: 150,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/splash-icon-light.png",
            imageWidth: 150,
            resizeMode: "contain",
            backgroundColor: "#151718",
          },
        },
      ],
      "expo-web-browser",
      "expo-notifications",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
      eas: {
        projectId: "1c4bcd8c-d599-43cc-8cae-decc1a455423",
      },
    },
  },
};
