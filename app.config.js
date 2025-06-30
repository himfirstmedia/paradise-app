import 'dotenv/config';

export default {
  expo: {
    name: "Paradise",
    slug: "Paradise-App",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/ic_launcher.png",
    scheme: "paradiseapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.albert2moon.ParadiseApp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo-new.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.albert2moon.ParadiseApp"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/ic_launcher-web.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo-new.png",
          imageWidth: 150,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-web-browser",
      "expo-notifications"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "9f85f5ed-1107-4df2-87c0-24a04bdee28d"
      },
      BASE_URL: process.env.BASE_URL,
    },
    owner: "albertmoon"
  }
};
