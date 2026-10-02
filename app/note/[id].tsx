import { useLocalSearchParams } from "expo-router";
import { ContentDetail } from "../../src/features/learn/ContentDetail";
export default function Note() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ContentDetail id={id} />;
}
