import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type TextStyle,
} from "react-native";
import { router } from "expo-router";
import { Settings, ChevronRight, BookOpen, Sigma } from "lucide-react-native";
import { usePreferences } from "../stores/preferences";
import type { ContentItem, Entity } from "../types/content";
export function useTheme() {
  const setting = usePreferences((s) => s.theme);
  const system = useColorScheme();
  const dark =
    setting === "dark" || (setting === "system" && system === "dark");
  return {
    dark,
    bg: dark ? "#101a20" : "#f4f7f5",
    surface: dark ? "#1b2931" : "#ffffff",
    text: dark ? "#ecf3f4" : "#172b34",
    muted: dark ? "#acbec5" : "#596d75",
    border: dark ? "#34464e" : "#dde7e2",
    primary: dark ? "#8ae1bd" : "#147d5c",
    soft: dark ? "#203d35" : "#e7f4ed",
    danger: dark ? "#ffb6b6" : "#b12e38",
  };
}
export function Label({
  children,
  muted = false,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  style?: TextStyle;
}) {
  const t = useTheme();
  return (
    <Text
      style={[
        { color: muted ? t.muted : t.text, fontSize: 16, lineHeight: 24 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const t = useTheme();
  const header = (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Label style={styles.title}>{title}</Label>
        {subtitle && (
          <Label muted style={{ fontSize: 14 }}>
            {subtitle}
          </Label>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={() => router.push("/settings")}
        style={styles.iconButton}
      >
        <Settings color={t.primary} size={23} />
      </Pressable>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.screen}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
      )}
    </View>
  );
}
export function Card({
  children,
  onPress,
  label,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  label?: string;
}) {
  const t = useTheme();
  const style = [
    styles.card,
    { backgroundColor: t.surface, borderColor: t.border },
  ];
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={style}
    >
      {children}
    </Pressable>
  ) : (
    <View style={style}>{children}</View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: secondary ? t.soft : t.primary,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: secondary ? t.primary : t.dark ? "#102820" : "#fff",
          fontSize: 15,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Chip({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? t.soft : t.surface,
          borderColor: selected ? t.primary : t.border,
        },
      ]}
    >
      <Label style={{ fontSize: 14, color: selected ? t.primary : t.text }}>
        {title}
      </Label>
    </Pressable>
  );
}
export function Chips({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 14,
      }}
    >
      {children}
    </View>
  );
}
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Label style={styles.section}>{title}</Label>
      {children}
    </View>
  );
}
export function Empty({
  title = "No content available yet.",
  detail = "Try another selection or check back in a future content release.",
}: {
  title?: string;
  detail?: string;
}) {
  const t = useTheme();
  return (
    <Card>
      <BookOpen color={t.primary} size={27} />
      <Label style={{ fontWeight: "700", marginTop: 8 }}>{title}</Label>
      <Label muted style={{ fontSize: 14, marginTop: 4 }}>
        {detail}
      </Label>
    </Card>
  );
}
export function QueryState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error?: string;
  retry?: () => void;
}) {
  const t = useTheme();
  return loading ? (
    <ActivityIndicator color={t.primary} style={{ padding: 20 }} />
  ) : error ? (
    <Card>
      <Label style={{ color: t.danger }}>{error}</Label>
      {retry && <Button title="Retry" onPress={retry} />}
    </Card>
  ) : null;
}
export function FormulaRenderer({ formula }: { formula: string }) {
  const t = useTheme();
  return (
    <View style={[styles.equation, { backgroundColor: t.soft }]}>
      <Text
        selectable
        style={{
          fontSize: 23,
          lineHeight: 34,
          fontWeight: "600",
          color: t.primary,
        }}
      >
        {formula}
      </Text>
    </View>
  );
}
export function ContentCard({ item }: { item: ContentItem }) {
  const mode = usePreferences((s) => s.learningMode);
  const t = useTheme();
  return (
    <Card
      label={item.title}
      onPress={() =>
        router.push({
          pathname:
            item.type === "formula"
              ? "/formula/[id]"
              : item.type === "short_note"
                ? "/note/[id]"
                : "/content/[id]",
          params: { id: item.id },
        })
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <Sigma size={17} color={t.primary} />
        <Label muted style={{ fontSize: 12, textTransform: "uppercase" }}>
          {item.type.replaceAll("_", " ")} · {item.difficulty}
        </Label>
      </View>
      <Label style={{ fontWeight: "700", marginVertical: 6 }}>
        {item.title}
      </Label>
      {item.formula && item.type !== "content_reference" && (
        <FormulaRenderer formula={item.formula} />
      )}
      {item.needsReview && (
        <Label style={{ color: t.danger, fontSize: 12, fontWeight: "700" }}>
          Needs review
        </Label>
      )}
      <Label muted style={{ fontSize: 14, marginTop: 6 }}>
        {item.summary}
      </Label>
      {mode === "learn" && item.type === "formula" && (
        <Label muted style={{ fontSize: 14, marginTop: 6 }}>
          {item.whenToUse}
        </Label>
      )}
    </Card>
  );
}
export function EntityCard({
  entity,
  detail,
  onPress,
}: {
  entity: Entity;
  detail?: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Card onPress={onPress} label={entity.name}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Label style={{ fontWeight: "700" }}>{entity.name}</Label>
          {detail && (
            <Label muted style={{ fontSize: 14 }}>
              {detail}
            </Label>
          )}
        </View>
        <ChevronRight color={t.primary} size={21} />
      </View>
    </Card>
  );
}
export function ContentList({
  items,
  header,
  onLoadMore,
}: {
  items: ContentItem[];
  header?: React.ReactElement;
  onLoadMore?: () => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <ContentCard item={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<Empty />}
      ListFooterComponent={
        onLoadMore ? (
          <Button title="Load more" secondary onPress={onLoadMore} />
        ) : undefined
      }
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
    />
  );
}
export function Input({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
}) {
  const t = useTheme();
  return (
    <TextInput
      accessibilityLabel={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.muted}
      autoCapitalize="none"
      style={{
        backgroundColor: t.surface,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 15,
        color: t.text,
        fontSize: 16,
        marginBottom: 14,
      }}
    />
  );
}
export function ModeToggle() {
  const mode = usePreferences((s) => s.learningMode);
  const set = usePreferences((s) => s.setLearningMode);
  return (
    <Chips>
      <Chip
        title="Quick Formula"
        selected={mode === "quick"}
        onPress={() => set("quick")}
      />
      <Chip
        title="Learn Mode"
        selected={mode === "learn"}
        onPress={() => set("learn")}
      />
    </Chips>
  );
}
export const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 4, paddingBottom: 40 },
  header: {
    padding: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 28, lineHeight: 36, fontWeight: "800" },
  section: { fontSize: 19, fontWeight: "700", marginBottom: 12 },
  card: { padding: 17, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  button: {
    padding: 15,
    borderRadius: 13,
    marginVertical: 6,
    minHeight: 48,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 24,
  },
  equation: { padding: 14, borderRadius: 12, marginVertical: 6 },
  iconButton: { padding: 12, minWidth: 48, minHeight: 48 },
});
