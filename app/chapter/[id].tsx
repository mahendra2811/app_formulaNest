import { useLocalSearchParams } from "expo-router";
import { HierarchyContent } from "../../src/features/learn/HierarchyContent";
export default function Chapter() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <HierarchyContent id={id} kind="chapter" />;
}
