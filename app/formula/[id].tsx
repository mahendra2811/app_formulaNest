import { useLocalSearchParams } from "expo-router";
import { ContentDetail } from "../../src/features/learn/ContentDetail";
export default function Formula() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ContentDetail id={id} />;
}
