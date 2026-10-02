import { Tabs, Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House, BookOpen, Target, Search, Library } from "lucide-react-native";
import { useTheme } from "../../src/components/ui";
import { usePreferences } from "../../src/stores/preferences";
export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { hydrated, preferences } = usePreferences();
  if (!hydrated) return <ActivityIndicator />;
  if (!preferences.completed) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      {[
        ["home", "Home", House],
        ["learn", "Learn", BookOpen],
        ["practice", "Practice", Target],
        ["search", "Search", Search],
        ["library", "Library", Library],
      ].map(([name, title, Icon]) => {
        const TabIcon = Icon as typeof House;
        return (
          <Tabs.Screen
            key={name as string}
            name={name as string}
            options={{
              title: title as string,
              tabBarIcon: ({ color, size }) => (
                <TabIcon color={color} size={size} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
