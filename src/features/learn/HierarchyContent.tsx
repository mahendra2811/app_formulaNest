import { router } from "expo-router";
import { useState } from "react";
import {
  ContentList,
  Empty,
  EntityCard,
  Label,
  ModeToggle,
  QueryState,
  Screen,
} from "../../components/ui";
import { useDatabase } from "../../hooks/database";
import { useQuery } from "../../hooks/query";
import { audienceFilter, usePreferences } from "../../stores/preferences";
export function HierarchyContent({
  id,
  kind,
}: {
  id: string;
  kind: "chapter" | "topic";
}) {
  const { repo } = useDatabase();
  const [limit, setLimit] = useState(100);
  const filter = {
    ...audienceFilter(usePreferences((s) => s.preferences)),
    ...(kind === "chapter" ? { chapterId: id } : { topicId: id }),
  };
  const q = useQuery(
    async () => ({
      entity: (
        await repo.entities(kind === "chapter" ? "chapters" : "topics")
      ).find((e) => e.id === id),
      items: await repo.content({ ...filter, limit }),
      topics:
        kind === "chapter"
          ? await repo.availableEntities("topics", filter)
          : [],
    }),
    [filter, limit],
  );
  return (
    <Screen
      title={q.data?.entity?.name ?? (kind === "chapter" ? "Chapter" : "Topic")}
      scroll={false}
    >
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data && !q.data.entity ? (
        <Empty
          title={`${kind === "chapter" ? "Chapter" : "Topic"} not found`}
        />
      ) : (
        q.data && (
          <ContentList
            items={q.data.items}
            onLoadMore={
              q.data.items.length === limit && !q.loading
                ? () => setLimit((n) => n + 100)
                : undefined
            }
            header={
              <>
                <ModeToggle />
                {q.data.topics.length > 0 && (
                  <>
                    <Label style={{ fontWeight: "700", marginBottom: 10 }}>
                      Topics
                    </Label>
                    {q.data.topics.map((entity) => (
                      <EntityCard
                        key={entity.id}
                        entity={entity}
                        onPress={() =>
                          router.push({
                            pathname: "/topic/[id]",
                            params: { id: entity.id },
                          })
                        }
                      />
                    ))}
                  </>
                )}
              </>
            }
          />
        )
      )}
    </Screen>
  );
}
