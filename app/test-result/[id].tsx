import { useLocalSearchParams, router } from "expo-router";
import {
  Button,
  Card,
  Empty,
  Label,
  QueryState,
  Screen,
  Section,
  useTheme,
} from "../../src/components/ui";
import { useDatabase } from "../../src/hooks/database";
import { useQuery } from "../../src/hooks/query";
import { scoreAttempt } from "../../src/utils/scoring";
export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { repo } = useDatabase();
  const q = useQuery(() => repo.attempt(id), [id]);
  const a = q.data;
  const score = a ? scoreAttempt(a) : null;
  const t = useTheme();
  return (
    <Screen title="Your practice result">
      <QueryState loading={q.loading} error={q.error} retry={q.reload} />
      {q.data === null && <Empty title="Result not found" />}
      {a && !a.finished && (
        <>
          <Empty title="This test is still in progress" />
          <Button
            title="Continue test"
            onPress={() =>
              router.replace({ pathname: "/test/[id]", params: { id } })
            }
          />
        </>
      )}
      {a?.finished && score && (
        <>
          <Card>
            <Label
              style={{
                fontSize: 40,
                lineHeight: 50,
                fontWeight: "800",
                color: t.primary,
              }}
            >
              {score.correct}/{score.total}
            </Label>
            <Label style={{ fontSize: 20 }}>{score.accuracy}% accuracy</Label>
            <Label muted>
              {score.correct} correct · {score.incorrect} incorrect ·{" "}
              {score.unanswered} unanswered
            </Label>
          </Card>
          <Button
            title="Practice again"
            onPress={() => router.replace("/(tabs)/practice")}
          />
          <Button
            secondary
            title="Back to Library"
            onPress={() => router.replace("/(tabs)/library")}
          />
          <Section title="Review your answers">
            {a.questions.map((question) => {
              const choice = a.answers[question.id];
              const correct = choice === question.correctAnswer;
              return (
                <Card key={question.id}>
                  <Label style={{ fontWeight: "700" }}>
                    {question.question}
                  </Label>
                  <Label style={{ color: correct ? t.primary : t.danger }}>
                    Your answer:{" "}
                    {choice === undefined
                      ? "Unanswered"
                      : question.options[choice]}
                  </Label>
                  <Label>
                    Correct answer: {question.options[question.correctAnswer]}
                  </Label>
                  <Label muted>{question.explanation}</Label>
                  {question.linkedContentIds.map((link) => (
                    <Button
                      key={link}
                      secondary
                      title="Review linked content"
                      onPress={() =>
                        router.push({
                          pathname: "/content/[id]",
                          params: { id: link },
                        })
                      }
                    />
                  ))}
                </Card>
              );
            })}
          </Section>
        </>
      )}
    </Screen>
  );
}
