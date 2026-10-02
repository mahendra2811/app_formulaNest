import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  Button,
  Card,
  Empty,
  Label,
  QueryState,
  Screen,
  useTheme,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
export default function Test() {
  const { id, requested } = useLocalSearchParams<{
    id: string;
    requested?: string;
  }>();
  const { repo } = useDatabase();
  const [position, setPosition] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = useTheme();
  const q = useQuery(() => repo.attempt(id), [id]);
  const a = q.data;
  const firstUnanswered =
    a?.questions.findIndex(
      (question) => a.answers[question.id] === undefined,
    ) ?? 0;
  const index =
    position ??
    (firstUnanswered < 0
      ? Math.max(0, (a?.questions.length ?? 1) - 1)
      : firstUnanswered);
  const question = a?.questions[index];
  const answer = question ? a?.answers[question.id] : undefined;
  const choose = async (option: number) => {
    if (!a || !question || answer !== undefined || busy) return;
    try {
      setBusy(true);
      setError("");
      setPosition(index);
      await repo.saveAttempt({
        ...a,
        answers: { ...a.answers, [question.id]: option },
      });
      q.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save answer.");
    } finally {
      setBusy(false);
    }
  };
  const next = async () => {
    if (!a) return;
    if (index < a.questions.length - 1) {
      setPosition(index + 1);
      return;
    }
    try {
      setBusy(true);
      await repo.saveAttempt({ ...a, finished: true, completedAt: Date.now() });
      router.replace({ pathname: "/test-result/[id]", params: { id: a.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not finish test.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title="One question at a time"
      subtitle={
        a ? `Question ${index + 1} of ${a.questions.length}` : undefined
      }
    >
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data === null && (
        <Empty
          title="Test not found"
          detail="Generate a new test from Practice."
        />
      )}
      {a?.finished && (
        <Button
          title="View completed result"
          onPress={() =>
            router.replace({ pathname: "/test-result/[id]", params: { id } })
          }
        />
      )}{" "}
      {a && !a.finished && question && (
        <>
          {requested && a.questions.length < Number(requested) && (
            <Label muted style={{ fontSize: 13, marginBottom: 12 }}>
              Only {a.questions.length} matching questions are available. Your
              test uses all of them.
            </Label>
          )}
          <Card>
            <Label style={{ fontSize: 20, lineHeight: 30, fontWeight: "700" }}>
              {question.question}
            </Label>
            <Label muted style={{ fontSize: 13, marginTop: 12 }}>
              {question.difficulty}
            </Label>
            {question.needsReview && <Label style={{ color: t.danger, fontWeight: "700", marginTop: 8 }}>Needs review</Label>}
            {question.needsReview && question.reviewReasons?.map((reason, index) => <Label key={`${reason}-${index}`} muted>{reason}</Label>)}
          </Card>
          {question.options.map((option, i) => (
            <Button
              key={i}
              disabled={busy || answer !== undefined}
              secondary
              title={`${String.fromCharCode(65 + i)}. ${option}${answer !== undefined && i === question.correctAnswer ? " ✓ Correct answer" : answer === i ? " · Your answer" : ""}`}
              onPress={() => choose(i)}
            />
          ))}
          {answer !== undefined && (
            <Card>
              <Label
                style={{
                  fontWeight: "700",
                  color:
                    answer === question.correctAnswer ? t.primary : t.danger,
                }}
              >
                {answer === question.correctAnswer ? "Correct!" : "Not quite."}
              </Label>
              <Label>{question.explanation}</Label>
              <Button
                title={
                  index === a.questions.length - 1
                    ? "Finish & view result"
                    : "Next question"
                }
                disabled={busy}
                onPress={next}
              />
            </Card>
          )}
          <Label muted style={{ fontSize: 13 }}>
            Your answers are saved immediately. You can resume this test from
            Library → History.
          </Label>
        </>
      )}
      {!!error && <Label style={{ color: t.danger }}>{error}</Label>}
    </Screen>
  );
}
