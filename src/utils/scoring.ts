import type { Attempt } from "../types/content";
export function scoreAttempt(attempt: Attempt) {
  const total = attempt.questions.length;
  const correct = attempt.questions.filter(
    (q) => attempt.answers[q.id] === q.correctAnswer,
  ).length;
  const answered = attempt.questions.filter(
    (q) => attempt.answers[q.id] !== undefined,
  ).length;
  return {
    total,
    correct,
    incorrect: answered - correct,
    unanswered: total - answered,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
  };
}
