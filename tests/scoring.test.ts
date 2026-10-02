import { describe, it, expect } from "vitest";
import { scoreAttempt } from "../src/utils/scoring";
import { sampleData } from "../src/data/sample";
describe("MCQ scoring", () => {
  it("distinguishes correct, incorrect and unanswered", () => {
    const questions = sampleData.questions.slice(0, 3);
    const score = scoreAttempt({
      id: "a",
      questions,
      answers: {
        [questions[0].id]: questions[0].correctAnswer,
        [questions[1].id]: (questions[1].correctAnswer + 1) % 4,
      },
      finished: true,
      createdAt: 0,
    });
    expect(score).toEqual({
      total: 3,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      accuracy: 33,
    });
  });
  it("handles an empty attempt", () => {
    expect(
      scoreAttempt({
        id: "a",
        questions: [],
        answers: {},
        finished: false,
        createdAt: 0,
      }).accuracy,
    ).toBe(0);
  });
});
