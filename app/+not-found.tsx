import { router } from "expo-router";
import { Button, Empty, Screen } from "../src/components/ui";
export default function NotFound() {
  return (
    <Screen title="Page not found">
      <Empty title="This page is not available" />
      <Button title="Return home" onPress={() => router.replace("/")} />
    </Screen>
  );
}
