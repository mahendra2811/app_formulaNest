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
} from "../src/components/ui";
import { useDatabase } from "../src/hooks/database";
import { useQuery } from "../src/hooks/query";
import { audienceFilter, usePreferences } from "../src/stores/preferences";
export default function Onboarding() {
  const { repo } = useDatabase();
  const saved = usePreferences((s) => s.preferences);
  const setPreferences = usePreferences((s) => s.setPreferences);
  const [draft, setDraft] = useState(saved);
  const [step, setStep] = useState(0);
  const filter = { ...audienceFilter(draft), subjectIds: undefined };
  const q = useQuery(
    async () => ({
      classes: await repo.entities("classes"),
      exams: await repo.entities("exams"),
      boards: await repo.entities("boards"),
      streams: await repo.entities("streams"),
      subjects: await repo.availableEntities("subjects", filter),
    }),
    [filter],
  );
  const update = (value: Partial<typeof draft>) =>
    setDraft((d) => ({ ...d, ...value, subjectIds: [] }));
  const finish = () => {
    setPreferences({ ...draft, completed: true });
    router.replace("/(tabs)/home");
  };
  return (
    <Screen
      title={
        saved.completed ? "Change your study plan" : "Your revision, simplified"
      }
      subtitle={`Step ${step + 1} of 3 · Works entirely offline`}
    >
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {step === 0 && (
        <>
          <Card>
            <Label style={{ fontSize: 21, fontWeight: "700", marginBottom: 8 }}>
              What are you preparing for?
            </Label>
            <Label muted>Choose a goal. You can change it later.</Label>
          </Card>
          <Button
            title="School"
            secondary={draft.mode !== "school"}
            onPress={() => update({ mode: "school" })}
          />
          <Button
            title="Competitive Exam"
            secondary={draft.mode !== "competitive"}
            onPress={() => update({ mode: "competitive" })}
          />
        </>
      )}
      {step === 1 && (
        <>
          {draft.mode === "school" ? (
            <>
              <Section title="Choose your class">
                <Chips>
                  {q.data?.classes.map((e) => (
                    <Chip
                      key={e.id}
                      title={e.name}
                      selected={draft.classId === e.id}
                      onPress={() => update({ classId: e.id })}
                    />
                  ))}
                </Chips>
              </Section>
              <Section title="Board">
                <Chips>
                  {q.data?.boards.map((e) => (
                    <Chip
                      key={e.id}
                      title={e.name}
                      selected={draft.boardId === e.id}
                      onPress={() => update({ boardId: e.id })}
                    />
                  ))}
                </Chips>
              </Section>
              {["class-11", "class-12"].includes(draft.classId) && (
                <Section title="Stream">
                  <Chips>
                    {q.data?.streams.map((e) => (
                      <Chip
                        key={e.id}
                        title={e.name}
                        selected={draft.streamId === e.id}
                        onPress={() => update({ streamId: e.id })}
                      />
                    ))}
                  </Chips>
                </Section>
              )}
            </>
          ) : (
            <Section title="Choose your exam">
              <Chips>
                {q.data?.exams.map((e) => (
                  <Chip
                    key={e.id}
                    title={e.name}
                    selected={draft.examId === e.id}
                    onPress={() => update({ examId: e.id })}
                  />
                ))}
              </Chips>
            </Section>
          )}
          <Label muted>
            Supplied starter packs cover multiple classes, boards, streams and
            exams. Coverage is partial; some supported selections, including
            Science in Classes 6–8, may have no content yet.
          </Label>
        </>
      )}
      {step === 2 && (
        <Section title="Choose your subjects">
          <Chips>
            {q.data?.subjects.map((e) => (
              <Chip
                key={e.id}
                title={e.name}
                selected={draft.subjectIds.includes(e.id)}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    subjectIds: d.subjectIds.includes(e.id)
                      ? d.subjectIds.filter((id) => id !== e.id)
                      : [...d.subjectIds, e.id],
                  }))
                }
              />
            ))}
          </Chips>
          {!q.loading && !q.data?.subjects.length && (
            <Empty
              title="Content coming soon"
              detail="This audience is available in your study plan, but the supplied starter packs do not currently include content for this selection."
            />
          )}
        </Section>
      )}
      {step > 0 && (
        <Button title="Back" secondary onPress={() => setStep((s) => s - 1)} />
      )}
      <Button
        title={step === 2 ? "Start learning" : "Continue"}
        disabled={
          q.loading ||
          !!q.error ||
          (step === 2 && !!q.data?.subjects.length && !draft.subjectIds.length)
        }
        onPress={() => (step === 2 ? finish() : setStep((s) => s + 1))}
      />
    </Screen>
  );
}
