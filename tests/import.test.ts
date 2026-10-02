import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { normalizeSources, type SourceInput } from "../src/data/normalize";
import { sampleData } from "../src/data/sample";
import { bundledData } from "../src/data/catalog";
import { validateDataset } from "../src/data/validate";
const directory = resolve("planning /preplexity");
const inputs: SourceInput[] = readdirSync(directory)
  .filter((n) => n.endsWith(".json"))
  .sort()
  .map((file) => {
    const raw = readFileSync(resolve(directory, file), "utf8");
    return {
      file,
      sha256: createHash("sha256").update(raw).digest("hex"),
      data: JSON.parse(raw) as unknown,
    };
  });
const normalized = normalizeSources(inputs, sampleData);
describe("all supplied JSON integration", () => {
  it("corrects the known Federalism placement while retaining the raw source", () => {
    const question = bundledData.questions.find(
      (q) => q.id === "q_ps_federalism",
    )!;
    expect(question.chapters).toEqual(["cbse_class11_political_science_7"]);
    expect(question.needsReview).toBe(true);
    expect(question.sourceVariants?.[0].record.chapter_id).toBe(
      "cbse_class12_geography_3",
    );
  });
  it("rejects invalid contextual placements and alias targets", () => {
    const invalid = structuredClone(bundledData);
    invalid.content[0].placements![0].subjects = ["missing-subject"];
    expect(() => validateDataset(invalid)).toThrow(
      /placement references missing subjects/,
    );
    const alias = structuredClone(bundledData);
    alias.contentAliases!.invalid = "missing-content";
    expect(() => validateDataset(alias)).toThrow(/Invalid content alias/);
  });
  it("reproduces the checked-in validated bundle deterministically", () => {
    expect(normalized.data).toEqual(bundledData);
    expect(validateDataset(bundledData)).toBe(bundledData);
    expect(normalized.report.counts.files).toBe(inputs.length);
  });
  it("accounts for every educational source record in every JSON file", () => {
    const represented = [
      ...bundledData.content,
      ...bundledData.questions,
    ].flatMap((i) => i.sourceVariants ?? []);
    for (const input of inputs) {
      const root = input.data as Record<string, unknown>;
      const entries = Array.isArray(input.data)
        ? input.data
        : [
            "content",
            "questions",
            "formula_references",
            "content_references",
          ].flatMap((key) =>
            Array.isArray(root[key]) ? (root[key] as unknown[]) : [],
          );
      for (const raw of entries) {
        const row = raw as Record<string, unknown>;
        expect(
          represented.some(
            (v) =>
              v.sourceId === row.id &&
              v.files.includes(input.file) &&
              JSON.stringify(v.record) === JSON.stringify(row),
          ),
          `${input.file}: ${String(row.id)}`,
        ).toBe(true);
      }
    }
    expect(bundledData.sources?.map((s) => s.file).sort()).toEqual(
      inputs.map((s) => s.file).sort(),
    );
  });
  it("merges shared formulas and resolves existing JEE canonical aliases", () => {
    const ohm = bundledData.content.filter((c) => c.id === "physics_ohms_law");
    expect(ohm).toHaveLength(1);
    expect(ohm[0].classes).toEqual(
      expect.arrayContaining(["class-10", "class-12"]),
    );
    expect(ohm[0].exams).toContain("jee-main");
    expect(bundledData.contentAliases?.math_quadratic_formula).toBe(
      "math_quadratic_roots",
    );
    expect(bundledData.contentAliases?.physics_faradays_law).toBe(
      "physics_faraday_law",
    );
    expect(bundledData.contentAliases?.["formula-21"]).toBe("physics_ohms_law");
  });
  it("preserves missing references without inventing formulas", () => {
    const pending = bundledData.content.find(
      (c) => c.id === "jee_main_math_ref_math_matrix_inverse",
    );
    expect(pending?.type).toBe("content_reference");
    expect(pending?.needsReview).toBe(true);
    expect(pending?.formula).toBe("");
    expect(normalized.report.missingOutputs.join(" ")).toContain("AI9");
  });
  it("keeps every rich content type and marks unsupplied illustrations", () => {
    const types = new Set(bundledData.content.map((c) => c.type));
    for (const type of [
      "reaction",
      "table",
      "graph",
      "timeline",
      "comparison",
      "accounting_entry",
      "concept",
      "thinker_theory",
      "diagram_reference",
      "map_reference",
      "common_trap",
    ])
      expect(types.has(type as never)).toBe(true);
    const diagram = bundledData.content.find((c) => c.type === "map_reference");
    expect(diagram?.details?.asset_required).toBe(true);
    expect(diagram?.needsReview).toBe(true);
    const table = bundledData.content.find(
      (c) => c.id === "math_trigonometry_standard_values",
    );
    expect(table?.details?.rows).toHaveLength(5);
  });
});
