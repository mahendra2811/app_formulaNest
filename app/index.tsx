import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";
import { usePreferences } from "../src/stores/preferences";
export default function Index() {
  const { hydrated, preferences } = usePreferences();
  if (!hydrated) return <ActivityIndicator style={{ flex: 1 }} />;
  return (
    <Redirect href={preferences.completed ? "/(tabs)/home" : "/onboarding"} />
  );
}
