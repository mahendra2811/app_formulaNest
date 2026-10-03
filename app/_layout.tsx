import React, { Component, Suspense, type ErrorInfo } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { bundledData } from "../src/data/catalog";
import { initializeDatabase } from "../src/db/import";
import { DatabaseProvider } from "../src/hooks/database";
import { Button, Label, useTheme } from "../src/components/ui";

class DatabaseErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: string | null; key: number }
> {
  state = { error: null as string | null, key: 0 };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error)
      return (
        <View style={{ padding: 28, flex: 1, justifyContent: "center" }}>
          <Label style={{ fontWeight: "700" }}>
            Local database could not open
          </Label>
          <Label>{this.state.error}</Label>
          <Button
            title="Retry database initialization"
            onPress={() =>
              this.setState((s) => ({ error: null, key: s.key + 1 }))
            }
          />
        </View>
      );
    return (
      <React.Fragment key={this.state.key}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
function Navigation() {
  const t = useTheme();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: t.bg }}
    >
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: "Preferences" }} />
        <Stack.Screen name="revision" options={{ title: "Revision" }} />
        <Stack.Screen name="subject/[id]" options={{ title: "Subject" }} />
        <Stack.Screen name="chapter/[id]" options={{ title: "Chapter" }} />
        <Stack.Screen name="topic/[id]" options={{ title: "Topic" }} />
        <Stack.Screen name="formula/[id]" options={{ title: "Formula" }} />
        <Stack.Screen name="note/[id]" options={{ title: "Short note" }} />
        <Stack.Screen name="content/[id]" options={{ title: "Study content" }} />
        <Stack.Screen name="sheet/[id]" options={{ title: "Formula sheet" }} />
        <Stack.Screen name="test/[id]" options={{ title: "Practice test" }} />
        <Stack.Screen
          name="test-result/[id]"
          options={{ title: "Test result" }}
        />
      </Stack>
    </SafeAreaView>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseErrorBoundary>
        <Suspense fallback={<ActivityIndicator style={{ flex: 1 }} />}>
          <SQLiteProvider
            databaseName="formula-nest-app.db"
            onInit={(db) => initializeDatabase(db, bundledData)}
            useSuspense
          >
            <DatabaseProvider>
              <Navigation />
            </DatabaseProvider>
          </SQLiteProvider>
        </Suspense>
      </DatabaseErrorBoundary>
    </SafeAreaProvider>
  );
}
