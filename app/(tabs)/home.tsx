import { router } from "expo-router";
import { useState } from "react";
import {
  Button,
  Card,
  ContentCard,
  Empty,
  EntityCard,
  Label,
  QueryState,
  Screen,
  Section,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { audienceFilter, usePreferences } from "../../src/stores/preferences";
export default function Home() {
  const { repo } = useDatabase();
  const p = usePreferences((s) => s.preferences);
  const filter = audienceFilter(p);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const q = useQuery(
    async () => ({
      subjects: await repo.availableEntities("subjects", filter),
      recent: await repo.collection("recent", filter),
      revision: await repo.collection("revision", filter),
      bookmarks: await repo.collection("bookmarks", filter),
      formulas: await repo.content({ ...filter, type: "formula" }),
      sheets: await repo.sheets(filter),
    }),
    [filter],
  );
  const formulas = q.data?.formulas ?? [];
  const [day] = useState(() => Math.floor(Date.now() / 86400000));
  const daily = formulas.length ? formulas[day % formulas.length] : undefined;
  const quiz = async () => {
    try {
      setStarting(true);
      setError("");
      const a = await repo.createTest({
        ...filter,
        count: 5,
        difficulty: "mixed",
      });
      if (a) router.push({ pathname: "/test/[id]", params: { id: a.id } });
      else setError("No questions available for this study plan yet.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create test.");
    } finally {
      setStarting(false);
    }
  };
  return (
    <Screen
      title="A little revision, every day"
      subtitle={
        p.mode === "school"
          ? `${p.classId.replace("class-", "Class ")} · ${p.boardId.toUpperCase()}`
          : p.examId.replaceAll("-", " ").toUpperCase()
      }
    >
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data && (
        <>
          <Section title="Continue studying">
            {q.data.recent[0] ? (
              <ContentCard item={q.data.recent[0]} />
            ) : (
              <Empty
                title="Start your first chapter"
                detail="Open a subject below. Your last viewed formula or note will appear here."
              />
            )}
          </Section>
          <Section title="Your subjects">
            {q.data.subjects.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                detail="Formulas, notes & practice"
                onPress={() =>
                  router.push({
                    pathname: "/subject/[id]",
                    params: { id: entity.id },
                  })
                }
              />
            ))}
            {!q.data.subjects.length && <Empty title="Content coming soon" />}
          </Section>
          {daily && (
            <Section title="Formula of the day">
              <ContentCard item={daily} />
            </Section>
          )}
          <Section title="Quick revision">
            {q.data.revision.slice(0, 3).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
            {!q.data.revision.length && (
              <Empty
                title="No revision items"
                detail="Mark a formula or note for revision to find it here."
              />
            )}
          </Section>
          <Card>
            <Label style={{ fontWeight: "700" }}>
              Five questions. One small step.
            </Label>
            <Label muted>
              Practice with questions from your selected subjects.
            </Label>
            <Button
              title="Quick 5 Questions"
              onPress={quiz}
              disabled={starting}
            />
            {!!error && <Label>{error}</Label>}
          </Card>
          <Section title="Recently viewed">
            {q.data.recent.slice(0, 3).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
            {!q.data.recent.length && <Empty title="No recent items yet" />}
          </Section>
          <Section title="Bookmarks">
            {q.data.bookmarks.slice(0, 3).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
            {!q.data.bookmarks.length && <Empty title="No bookmarks yet" />}
          </Section>
          <Section title="Formula sheets">
            {q.data.sheets.map((sheet) => (
              <EntityCard
                key={sheet.id}
                entity={{ id: sheet.id, name: sheet.title }}
                detail={sheet.description}
                onPress={() =>
                  router.push({
                    pathname: "/sheet/[id]",
                    params: { id: sheet.id },
                  })
                }
              />
            ))}
            {!q.data.sheets.length && (
              <Empty title="No formula sheets for this study plan yet" />
            )}
          </Section>
        </>
      )}
    </Screen>
  );
}
