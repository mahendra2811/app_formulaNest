import { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chip,
  Chips,
  Empty,
  Label,
  QueryState,
  Screen,
  Section,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { audienceFilter, usePreferences } from "../../src/stores/preferences";
import type { Difficulty } from "../../src/types/content";
export default function Practice() {
  const preferences = usePreferences((s) => s.preferences);
  return <PracticeContent key={JSON.stringify(preferences)} />;
}
function PracticeContent() {
  const { repo } = useDatabase();
  const filter = audienceFilter(usePreferences((s) => s.preferences));
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty | "mixed">("mixed");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const q = useQuery(
    async () => ({
      subjects: await repo.availableEntities("subjects", filter),
      chapters: await repo.availableEntities("chapters", {
        ...filter,
        ...(subject ? { subjectIds: [subject] } : {}),
      }),
    }),
    [filter, subject],
  );
  const start = async (quick = false) => {
    try {
      setBusy(true);
      setError("");
      const attempt = await repo.createTest({
        ...filter,
        ...(!quick && subject ? { subjectIds: [subject] } : {}),
        ...(!quick && chapter ? { chapterId: chapter } : {}),
        count: quick ? 5 : count,
        difficulty: quick ? "mixed" : difficulty,
      });
      if (!attempt) {
        setError(
          "No questions available for this configuration. Try Mixed difficulty or another chapter.",
        );
        return;
      }
      router.push({
        pathname: "/test/[id]",
        params: { id: attempt.id, requested: String(quick ? 5 : count) },
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not generate your offline test.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title="Practice builds confidence"
      subtitle="Every question and explanation is available offline."
    >
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      <Card>
        <Label style={{ fontWeight: "700" }}>A quick check-in</Label>
        <Button
          title="Quick 5 Questions"
          disabled={busy || q.loading}
          onPress={() => start(true)}
        />
      </Card>
      <Section title="Build your test">
        <Label muted>
          Select a subject for subject practice, or narrow it to a chapter.
        </Label>
        <Chips>
          <Chip
            title="All selected subjects"
            selected={!subject}
            onPress={() => {
              setSubject("");
              setChapter("");
            }}
          />
          {q.data?.subjects.map((e) => (
            <Chip
              key={e.id}
              title={e.name}
              selected={subject === e.id}
              onPress={() => {
                setSubject(e.id);
                setChapter("");
              }}
            />
          ))}
        </Chips>
        <Label>Chapter</Label>
        <Chips>
          <Chip
            title="All chapters"
            selected={!chapter}
            onPress={() => setChapter("")}
          />
          {q.data?.chapters.map((e) => (
            <Chip
              key={e.id}
              title={e.name}
              selected={chapter === e.id}
              onPress={() => setChapter(e.id)}
            />
          ))}
        </Chips>
        <Label>Question count</Label>
        <Chips>
          {[5, 10, 20].map((n) => (
            <Chip
              key={n}
              title={String(n)}
              selected={count === n}
              onPress={() => setCount(n)}
            />
          ))}
        </Chips>
        <Label>Difficulty</Label>
        <Chips>
          {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
            <Chip
              key={d}
              title={d[0].toUpperCase() + d.slice(1)}
              selected={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </Chips>
        <Label muted style={{ fontSize: 13 }}>
          If fewer questions match, your test will use the available set.
        </Label>
        <Button
          title="Generate offline test"
          disabled={busy || q.loading || !!q.error}
          onPress={() => start()}
        />
        {!!error && <Empty title="Try another configuration" detail={error} />}
      </Section>
      <Button
        title="Open revision list"
        secondary
        onPress={() => router.push("/revision")}
      />
    </Screen>
  );
}
