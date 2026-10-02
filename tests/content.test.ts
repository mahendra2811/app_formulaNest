import { describe, expect, it } from "vitest";
import { sampleData } from "../src/data/sample";
import { DatasetValidationError, validateDataset } from "../src/data/validate";

describe("sample content dataset", () => {
  it("accepts the complete bounded sample with the requested counts", () => {
    expect(validateDataset(sampleData)).toBe(sampleData);
    expect(
      sampleData.content.filter((item) => item.type === "formula"),
    ).toHaveLength(29);
    expect(
      sampleData.content.filter((item) => item.type === "short_note"),
    ).toHaveLength(11);
    expect(sampleData.questions).toHaveLength(24);
    expect(sampleData.chapters).toHaveLength(4);
    expect(sampleData.subjects.map(({ id }) => id)).toEqual([
      "mathematics",
      "physics",
    ]);
    expect(sampleData.sheets).toHaveLength(3);
  });

  it("reports a missing linked content reference", () => {
    const malformed = structuredClone(sampleData);
    malformed.questions[0].linkedContentIds = ["missing-formula"];

    expect(() => validateDataset(malformed)).toThrow(DatasetValidationError);
    expect(() => validateDataset(malformed)).toThrow(
      /linkedContentIds references missing content/,
    );
  });

  it("reports duplicate IDs within an entity group", () => {
    const malformed = structuredClone(sampleData);
    malformed.content[1].id = malformed.content[0].id;

    expect(() => validateDataset(malformed)).toThrow(/duplicates/);
  });

  it("rejects answer indexes outside the four options", () => {
    const malformed = structuredClone(sampleData);
    malformed.questions[0].correctAnswer = 4;

    expect(() => validateDataset(malformed)).toThrow(
      /correctAnswer must be an integer from 0 to 3/,
    );
  });

  it("rejects questions without exactly four options", () => {
    const malformed = structuredClone(sampleData);
    malformed.questions[0].options.pop();

    expect(() => validateDataset(malformed)).toThrow(
      /exactly four non-empty strings/,
    );
  });
});
