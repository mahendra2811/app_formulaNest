import { router, useLocalSearchParams } from "expo-router";
import { Empty, EntityCard, QueryState, Screen } from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { audienceFilter, usePreferences } from "../../src/stores/preferences";
export default function Subject() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repo } = useDatabase();
  const filter = {
    ...audienceFilter(usePreferences((s) => s.preferences)),
    subjectIds: [id],
  };
  const q = useQuery(
    async () => ({
      subject: (await repo.entities("subjects")).find((e) => e.id === id),
      chapters: await repo.availableEntities("chapters", filter),
    }),
    [filter],
  );
  return (
    <Screen title={q.data?.subject?.name ?? "Subject"}>
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data && !q.data.subject ? (
        <Empty title="Subject not found" />
      ) : (
        q.data?.chapters.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            onPress={() =>
              router.push({
                pathname: "/chapter/[id]",
                params: { id: entity.id },
              })
            }
          />
        ))
      )}
      {q.data?.subject && !q.data.chapters.length && <Empty />}
    </Screen>
  );
}
