import { router } from "expo-router";
import {
  Empty,
  EntityCard,
  ModeToggle,
  QueryState,
  Screen,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { audienceFilter, usePreferences } from "../../src/stores/preferences";
export default function Learn() {
  const { repo } = useDatabase();
  const filter = audienceFilter(usePreferences((s) => s.preferences));
  const q = useQuery(
    () => repo.availableEntities("subjects", filter),
    [filter],
  );
  return (
    <Screen
      title="Learn at your pace"
      subtitle="Pick a subject, then explore a chapter."
    >
      <ModeToggle />
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data?.map((entity) => (
        <EntityCard
          key={entity.id}
          entity={entity}
          onPress={() =>
            router.push({
              pathname: "/subject/[id]",
              params: { id: entity.id },
            })
          }
        />
      ))}
      {q.data?.length === 0 && <Empty title="Content coming soon" />}
    </Screen>
  );
}
