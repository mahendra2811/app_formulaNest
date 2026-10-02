import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SQLiteDatabase, SQLiteBindValue } from "expo-sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sampleData } from "../src/data/sample";
import { bundledData } from "../src/data/catalog";
import { importDataset, initializeDatabase } from "../src/db/import";
import { Repository } from "../src/db/repository";
import { scoreAttempt } from "../src/utils/scoring";

type SqlValue = string | number | null | Uint8Array;

function sqliteAdapter(native: DatabaseSync): SQLiteDatabase {
  const bind = (value: SQLiteBindValue): SqlValue => {
    if (typeof value === "boolean") return Number(value);
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      value === null ||
      value instanceof Uint8Array
    )
      return value;
    throw new TypeError("Unsupported SQLite bind value");
  };
  return {
    getFirstAsync: async <T>(sql: string, ...values: SQLiteBindValue[]) =>
      (native.prepare(sql).get(...values.map(bind)) as T | undefined) ?? null,
    getAllAsync: async <T>(sql: string, ...values: SQLiteBindValue[]) =>
      native.prepare(sql).all(...values.map(bind)) as T[],
    runAsync: async (sql: string, ...values: SQLiteBindValue[]) => {
      native.prepare(sql).run(...values.map(bind));
      return { changes: 0, lastInsertRowId: 0 };
    },
    execAsync: async (sql: string) => {
      native.exec(sql);
    },
    withTransactionAsync: async (task: () => Promise<void>) => {
      native.exec("BEGIN");
      try {
        await task();
        native.exec("COMMIT");
      } catch (error) {
        native.exec("ROLLBACK");
        throw error;
      }
    },
  } as unknown as SQLiteDatabase;
}

describe("database integration", () => {
  let directory: string;
  let file: string;
  let native: DatabaseSync;
  let db: SQLiteDatabase;
  let repository: Repository;

  const open = () => {
    native = new DatabaseSync(file);
    db = sqliteAdapter(native);
    repository = new Repository(db);
  };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "formula-learner-"));
    file = join(directory, "test.sqlite");
    open();
  });

  afterEach(() => {
    native.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it("initializes the schema and seeds a dataset idempotently", async () => {
    await initializeDatabase(db, sampleData);
    const original = await repository.content();
    await initializeDatabase(db, sampleData);

    expect(await repository.content()).toEqual(original);
    expect(
      (
        await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) AS count FROM content",
        )
      )?.count,
    ).toBe(sampleData.content.length);
    expect(
      (
        await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM metadata WHERE key='dataset_version'",
        )
      )?.value,
    ).toBe(String(sampleData.version));
  });

  it("imports the full bundled dataset and remains idempotent", async () => {
    await initializeDatabase(db, bundledData);
    const count = (
      await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) AS count FROM content",
      )
    )?.count;
    const original = await repository.content({ limit: 10_000 });

    await initializeDatabase(db, bundledData);

    expect(count).toBe(bundledData.content.length);
    expect(original).toHaveLength(bundledData.content.length);
    expect(await repository.content({ limit: 10_000 })).toEqual(original);
    expect(
      (
        await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) AS count FROM questions",
        )
      )?.count,
    ).toBe(bundledData.questions.length);
    expect(
      (
        await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM metadata WHERE key='dataset_fingerprint'",
        )
      )?.value,
    ).toBe(bundledData.fingerprint);
  });

  it("keeps Class 12 Physics chapter results separate from shared Class 10 Science Ohm content", async () => {
    await initializeDatabase(db, bundledData);
    const physics = {
      mode: "school" as const,
      classId: "class-12",
      boardId: "cbse",
      streamId: "science",
      subjectIds: ["physics"],
    };
    const class12Chapters = await repository.availableEntities(
      "chapters",
      physics,
    );
    const ohmsLaw = await repository.item("physics_ohms_law");
    const class10Science = await repository.content({
      mode: "school",
      classId: "class-10",
      boardId: "cbse",
      subjectIds: ["science"],
      chapterId: "cbse_class10_science_12",
    });

    expect(ohmsLaw?.placements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          classes: expect.arrayContaining(["class-12"]),
          subjects: expect.arrayContaining(["physics"]),
          chapters: expect.arrayContaining(["cbse_class12_physics_3"]),
        }),
        expect.objectContaining({
          classes: expect.arrayContaining(["class-10"]),
          subjects: expect.arrayContaining(["science"]),
          chapters: expect.arrayContaining(["cbse_class10_science_12"]),
        }),
      ]),
    );
    expect(class10Science.map((item) => item.id)).toContain("physics_ohms_law");
    expect(class12Chapters.map(({ id }) => id)).toContain(
      "cbse_class12_physics_3",
    );
    expect(class12Chapters.map(({ id }) => id)).not.toContain(
      "cbse_class10_science_12",
    );
  });

  it("shows metadata-only Class 6 Science hierarchy without content records", async () => {
    await initializeDatabase(db, bundledData);
    const scope = {
      mode: "school" as const,
      classId: "class-6",
      boardId: "cbse",
      subjectIds: ["science"],
    };
    const subjects = await repository.availableEntities("subjects", scope);
    const chapters = await repository.availableEntities("chapters", scope);

    expect(subjects.map(({ id }) => id)).toContain("science");
    expect(chapters.length).toBeGreaterThan(0);
    expect(
      chapters.every(({ id }) => id.startsWith("cbse_class6_science_")),
    ).toBe(true);
    expect(await repository.content(scope)).toEqual([]);
  });

  it("migrates saved sample IDs to canonical bundled IDs and resolves old URLs", async () => {
    await initializeDatabase(db, sampleData);
    await db.runAsync(
      "INSERT INTO bookmarks(kind,item_id,created_at) VALUES (?,?,?)",
      "content",
      "formula-21",
      1,
    );
    await db.runAsync(
      "INSERT INTO revision_items(item_id,status,updated_at) VALUES (?,?,?)",
      "formula-01",
      "revision",
      2,
    );
    await db.runAsync(
      "INSERT INTO recent_items(item_id,viewed_at) VALUES (?,?)",
      "formula-25",
      3,
    );

    await initializeDatabase(db, bundledData);

    expect(await repository.bookmarkIds()).toContain("physics_ohms_law");
    expect(await repository.status("math_quadratic_roots")).toBe("revision");
    expect(
      (await repository.collection("recent")).map(({ id }) => id),
    ).toContain("physics_electric_power");
    expect((await repository.item("formula-01"))?.id).toBe(
      "math_quadratic_roots",
    );
  });

  it("reimports changed data when the dataset version stays the same but its fingerprint changes", async () => {
    await initializeDatabase(db, bundledData);
    const changed = structuredClone(bundledData);
    const item = changed.content.find(({ id }) => id === "physics_ohms_law");
    expect(item).toBeDefined();
    item!.summary = "Updated bundle summary for fingerprint reimport.";
    changed.fingerprint = `${bundledData.fingerprint}-changed`;

    await initializeDatabase(db, changed);

    expect(changed.version).toBe(bundledData.version);
    expect((await repository.item("physics_ohms_law"))?.summary).toBe(
      "Updated bundle summary for fingerprint reimport.",
    );
    expect(
      (
        await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM metadata WHERE key='dataset_fingerprint'",
        )
      )?.value,
    ).toBe(changed.fingerprint);
  });

  it("filters audience content from the stored mappings", async () => {
    await initializeDatabase(db, sampleData);
    const math = await repository.content({
      mode: "school",
      classId: "class-10",
      boardId: "cbse",
      subjectIds: ["mathematics"],
    });
    const physics = await repository.content({
      mode: "school",
      classId: "class-12",
      boardId: "cbse",
      streamId: "science",
      subjectIds: ["physics"],
    });
    const jee = await repository.content({
      mode: "competitive",
      examId: "jee-main",
      subjectIds: ["physics"],
    });

    expect(math.length).toBeGreaterThan(0);
    expect(
      math.every(
        (item) =>
          item.classes.includes("class-10") &&
          item.boards.includes("cbse") &&
          item.subjects.includes("mathematics"),
      ),
    ).toBe(true);
    expect(physics.length).toBeGreaterThan(0);
    expect(
      physics.every(
        (item) =>
          item.classes.includes("class-12") &&
          item.streams.includes("science") &&
          item.subjects.includes("physics"),
      ),
    ).toBe(true);
    expect(jee.length).toBeGreaterThan(0);
    expect(
      jee.every(
        (item) =>
          item.exams.includes("jee-main") && item.subjects.includes("physics"),
      ),
    ).toBe(true);
    expect(math.map((item) => item.id)).toContain("formula-01");
    expect(physics.map((item) => item.id)).toContain("formula-21");
    expect(jee.map((item) => item.id)).toContain("formula-21");
  });

  it("returns no results for unsupported audiences", async () => {
    await initializeDatabase(db, sampleData);
    expect(
      await repository.content({ mode: "school", classId: "class-99" }),
    ).toEqual([]);
    expect(
      await repository.content({ mode: "school", boardId: "unknown-board" }),
    ).toEqual([]);
    expect(
      await repository.content({ mode: "school", streamId: "unknown-stream" }),
    ).toEqual([]);
  });

  it("searches indexed text fields and treats LIKE wildcards literally", async () => {
    await initializeDatabase(db, sampleData);
    expect(
      (
        await repository
          .content({ query: "sin" })
          .then((rows) => rows.map((row) => row.id))
      ).length,
    ).toBeGreaterThan(0);
    expect(
      (await repository.content({ query: "revision points" })).some(
        (item) => item.type === "short_note",
      ),
    ).toBe(true);
    expect(
      (await repository.content({ chapterId: "trigonometry" })).length,
    ).toBeGreaterThan(0);
    expect(
      (await repository.content({ query: "quadrant" })).some(
        (item) => item.type === "short_note",
      ),
    ).toBe(true);
    expect(await repository.content({ query: "%" })).toEqual([]);
    expect(await repository.content({ query: "%' OR 1=1 --" })).toEqual([]);
  });

  it("persists bookmark, recent, revision, and learned state across reopen", async () => {
    await initializeDatabase(db, sampleData);
    await repository.toggleBookmark("formula-01");
    await repository.recent("formula-01");
    await repository.revision("formula-01", "revision");
    await repository.revision("formula-02", "learned");
    native.close();
    open();

    expect(await repository.bookmarkIds()).toContain("formula-01");
    expect(
      (await repository.collection("recent")).map((item) => item.id),
    ).toContain("formula-01");
    expect(await repository.status("formula-01")).toBe("revision");
    expect(await repository.status("formula-02")).toBe("learned");
    await repository.toggleBookmark("formula-01");
    await repository.revision("formula-01", null);
    expect(await repository.bookmarkIds()).not.toContain("formula-01");
    expect(await repository.status("formula-01")).toBeNull();
  });

  it("deduplicates recent items and caps the list at thirty", async () => {
    await initializeDatabase(db, sampleData);
    for (let index = 0; index < 35; index++)
      await repository.recent(`recent-${index}`);
    await repository.recent("recent-34");
    const rows = await db.getAllAsync<{ item_id: string }>(
      "SELECT item_id FROM recent_items",
    );

    expect(rows).toHaveLength(30);
    expect(rows.filter((row) => row.item_id === "recent-34")).toHaveLength(1);
  });

  it("generates tests with count caps, difficulty and audience filters, and empty results", async () => {
    await initializeDatabase(db, sampleData);
    const requested = await repository.createTest({
      count: 2,
      difficulty: "mixed",
    });
    const capped = await repository.createTest({
      count: 100,
      difficulty: "mixed",
    });
    const easy = await repository.createTest({
      count: 100,
      difficulty: "easy",
      mode: "school",
      classId: "class-10",
      subjectIds: ["mathematics"],
    });
    const impossible = await repository.createTest({
      count: 10,
      difficulty: "hard",
      classId: "class-99",
    });

    expect(requested?.questions).toHaveLength(2);
    expect(capped?.questions).toHaveLength(sampleData.questions.length);
    expect(easy).not.toBeNull();
    expect(easy!.questions.length).toBeLessThanOrEqual(100);
    expect(
      easy!.questions.every(
        (question) =>
          question.difficulty === "easy" &&
          question.classes.includes("class-10") &&
          question.subjects.includes("mathematics"),
      ),
    ).toBe(true);
    expect(impossible).toBeNull();
  });

  it("saves attempts across reopen and scores correct, incorrect, and unanswered answers", async () => {
    await initializeDatabase(db, sampleData);
    const attempt = await repository.createTest({
      count: 3,
      difficulty: "mixed",
    });
    expect(attempt).not.toBeNull();
    const saved = {
      ...attempt!,
      answers: {
        [attempt!.questions[0].id]: attempt!.questions[0].correctAnswer,
        [attempt!.questions[1].id]:
          (attempt!.questions[1].correctAnswer + 1) % 4,
      },
      finished: true,
      completedAt: Date.now(),
    };
    await repository.saveAttempt(saved);
    native.close();
    open();

    const reopened = await repository.attempt(saved.id);
    expect(reopened).toEqual(saved);
    expect(scoreAttempt(reopened!)).toEqual({
      total: 3,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      accuracy: 33,
    });
  });

  it("rejects invalid imports without deleting existing dataset rows", async () => {
    await initializeDatabase(db, sampleData);
    const before = await repository.content();
    const invalid = structuredClone(sampleData);
    invalid.questions[0].linkedContentIds = ["missing-content"];

    await expect(importDataset(db, invalid)).rejects.toThrow(
      /references missing content/,
    );
    expect(await repository.content()).toEqual(before);
  });
  it("keeps every saved sample item visible beyond the recent-history cap", async () => {
    await initializeDatabase(db, sampleData);
    for (const item of sampleData.content) {
      await repository.toggleBookmark(item.id);
      await repository.revision(item.id, "revision");
    }
    expect(await repository.collection("bookmarks")).toHaveLength(
      sampleData.content.length,
    );
    expect(await repository.collection("revision")).toHaveLength(
      sampleData.content.length,
    );
  });
});
