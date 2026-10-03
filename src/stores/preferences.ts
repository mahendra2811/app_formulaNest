import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ContentFilter, Preferences } from "../types/content";

export const defaultPreferences: Preferences = {
  completed: false,
  mode: "school",
  classId: "class-10",
  examId: "jee-main",
  boardId: "cbse",
  streamId: "science",
  subjectIds: ["mathematics"],
};
interface State {
  preferences: Preferences;
  theme: "system" | "light" | "dark";
  learningMode: "quick" | "learn";
  hydrated: boolean;
  setPreferences: (p: Preferences) => void;
  setTheme: (t: State["theme"]) => void;
  setLearningMode: (m: State["learningMode"]) => void;
  setHydrated: () => void;
}
export const usePreferences = create<State>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      theme: "system",
      learningMode: "learn",
      hydrated: false,
      setPreferences: (preferences) => set({ preferences }),
      setTheme: (theme) => set({ theme }),
      setLearningMode: (learningMode) => set({ learningMode }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "formula-nest-app-preferences-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ preferences, theme, learningMode }) => ({
        preferences,
        theme,
        learningMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated();
        else usePreferences.setState({ hydrated: true });
      },
    },
  ),
);
export function audienceFilter(p: Preferences): ContentFilter {
  return {
    mode: p.mode,
    classId: p.classId,
    examId: p.examId,
    boardId: p.boardId,
    streamId: ["class-11", "class-12"].includes(p.classId)
      ? p.streamId
      : undefined,
    subjectIds: p.subjectIds,
  };
}
