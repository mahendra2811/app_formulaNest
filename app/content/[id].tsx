import { useLocalSearchParams } from "expo-router";
import { ContentDetail } from "../../src/features/learn/ContentDetail";

export default function Content() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ContentDetail id={id} />;
}
