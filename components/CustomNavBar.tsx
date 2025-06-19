import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";
// import { Image } from "expo-image";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const SECONDARY_COLOR = "#fff";

const ICONS: Record<string, any> = {
  index: require("@/assets/icons/home.png"),
  tasks: require("@/assets/icons/task.png"),
  teams: require("@/assets/icons/team.png"),
  profile: require("@/assets/icons/profile.png"),
};

const ICON_SIZE = 26;

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const PRIMARY_COLOR = useThemeColor({}, "selection");
  return (
    <View style={[styles.container, { backgroundColor: PRIMARY_COLOR }]}>
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" },
            ]}
          >
            <Image
              source={ICONS[route.name] || ICONS["index"]}
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                tintColor: isFocused ? PRIMARY_COLOR : SECONDARY_COLOR,
              }}
            />
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[styles.text, { color: PRIMARY_COLOR }]}
              >
                {label as string}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "95%",
    alignSelf: "center",
    bottom: 5,
    borderRadius: 40,
    paddingHorizontal: 12,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 13,
    borderRadius: 30,
  },
  text: {
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default CustomNavBar;