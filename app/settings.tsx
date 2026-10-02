import { router } from "expo-router";
import {
  Card,
  Chip,
  Chips,
  Label,
  Screen,
  Section,
  Button,
  ModeToggle,
} from "../src/components/ui";
import { usePreferences } from "../src/stores/preferences";
export default function Settings() {
  const { preferences, theme, setTheme } = usePreferences();
  return (
    <Screen title="Make it yours">
      <Section title="Study plan">
        <Card>
          <Label>
            {preferences.mode === "school"
              ? `${preferences.classId.replace("class-", "Class ")} · ${preferences.boardId.toUpperCase()}`
              : preferences.examId.replaceAll("-", " ").toUpperCase()}
          </Label>
          <Label muted>
            {preferences.subjectIds.join(" · ") || "Content coming soon"}
          </Label>
          <Button
            title="Change study plan"
            onPress={() => router.push("/onboarding")}
          />
        </Card>
      </Section>
      <Section title="Appearance">
        <Chips>
          {(["light", "dark", "system"] as const).map((value) => (
            <Chip
              key={value}
              title={`${value[0].toUpperCase()}${value.slice(1)}`}
              selected={theme === value}
              onPress={() => setTheme(value)}
            />
          ))}
        </Chips>
      </Section>
      <Section title="Content mode">
        <ModeToggle />
      </Section>
      <Card>
        <Label style={{ fontWeight: "700" }}>Formula Learner · Supplied starter packs</Label>
        <Label muted>
          Supplied starter packs and study progress are stored on this device.
          Coverage is partial and varies by class and subject. No account or
          internet connection is needed.
        </Label>
      </Card>
    </Screen>
  );
}
