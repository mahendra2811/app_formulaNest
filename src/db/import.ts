import type { SQLiteDatabase } from "expo-sqlite";
import type { Dataset, Mappings, Provenance } from "../types/content";
import { validateDataset } from "../data/validate";
import { migration } from "./schema";

const mappingKeys = [
  "classes",
  "exams",
  "subjects",
  "chapters",
  "topics",
  "boards",
  "streams",
] as const;
export async function importDataset(db: SQLiteDatabase, input: unknown) {
  const data: Dataset = validateDataset(input);
  const map = async (
    kind: string,
    id: string,
    mappings: Mappings & Provenance,
  ) => {
    for (const key of mappingKeys)
      for (const target of mappings[key])
        await db.runAsync(
          "INSERT INTO mappings VALUES (?,?,?,?)",
          kind,
          id,
          key,
          target,
        );
    for (const [placement, scope] of (
      mappings.placements ?? [mappings]
    ).entries())
      for (const key of mappingKeys)
        for (const target of scope[key])
          await db.runAsync(
            "INSERT INTO placement_mappings VALUES (?,?,?,?,?)",
            kind,
            id,
            placement,
            key,
            target,
          );
  };
  await db.withTransactionAsync(async () => {
    await db.execAsync(
      "DELETE FROM mappings; DELETE FROM placement_mappings; DELETE FROM content_aliases; DELETE FROM content; DELETE FROM questions; DELETE FROM formula_sheets; DELETE FROM entities;",
    );
    for (const kind of mappingKeys)
      for (const entity of data[kind]) {
        const parent =
          "subjectId" in entity
            ? entity.subjectId
            : "chapterId" in entity
              ? entity.chapterId
              : null;
        await db.runAsync(
          "INSERT INTO entities VALUES (?,?,?,?)",
          kind,
          entity.id,
          entity.name,
          parent,
        );
        if (entity.placements?.length) {
          const scope: Mappings = {
            classes: [],
            exams: [],
            subjects: [],
            chapters: [],
            topics: [],
            boards: [],
            streams: [],
          };
          for (const placement of entity.placements)
            for (const key of mappingKeys)
              scope[key] = Array.from(
                new Set([...scope[key], ...placement[key]]),
              );
          await map(kind, entity.id, {
            ...scope,
            placements: entity.placements,
          });
        }
      }
    const names = new Map(
      mappingKeys.flatMap((k) => data[k].map((e) => [e.id, e.name] as const)),
    );
    for (const item of data.content) {
      const searchable = [
        item.title,
        item.formula,
        item.summary,
        item.explanation,
        item.example,
        item.whenToUse,
        item.commonMistake,
        ...item.keywords,
        ...item.tags,
        ...item.body.flatMap((s) => [s.heading, ...s.bullets]),
        JSON.stringify(item.details ?? {}),
        ...mappingKeys.flatMap((k) => item[k].map((id) => names.get(id) ?? id)),
      ]
        .join(" ")
        .toLowerCase();
      await db.runAsync(
        "INSERT INTO content VALUES (?,?,?,?,?,?)",
        item.id,
        item.type,
        item.title,
        item.formula,
        searchable,
        JSON.stringify(item),
      );
      await map("content", item.id, item);
    }
    for (const q of data.questions) {
      await db.runAsync(
        "INSERT INTO questions VALUES (?,?,?)",
        q.id,
        q.difficulty,
        JSON.stringify(q),
      );
      await map("question", q.id, q);
    }
    for (const sheet of data.sheets) {
      await db.runAsync(
        "INSERT INTO formula_sheets VALUES (?,?,?)",
        sheet.id,
        sheet.title,
        JSON.stringify(sheet),
      );
      await map("sheet", sheet.id, sheet);
    }
    for (const [alias, target] of Object.entries(data.contentAliases ?? {})) {
      await db.runAsync(
        "INSERT INTO content_aliases VALUES (?,?)",
        alias,
        target,
      );
      // Collapse old sample/reference IDs without losing either row's saved state.
      await db.runAsync(
        "INSERT OR IGNORE INTO bookmarks(kind,item_id,created_at) SELECT kind,?,created_at FROM bookmarks WHERE kind='content' AND item_id=?",
        target,
        alias,
      );
      await db.runAsync(
        "DELETE FROM bookmarks WHERE kind='content' AND item_id=?",
        alias,
      );
      await db.runAsync(
        "INSERT INTO recent_items SELECT ?,viewed_at FROM recent_items WHERE item_id=? ON CONFLICT(item_id) DO UPDATE SET viewed_at=MAX(recent_items.viewed_at,excluded.viewed_at)",
        target,
        alias,
      );
      await db.runAsync("DELETE FROM recent_items WHERE item_id=?", alias);
      await db.runAsync(
        "INSERT INTO revision_items SELECT ?,status,updated_at FROM revision_items WHERE item_id=? ON CONFLICT(item_id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at WHERE excluded.updated_at>revision_items.updated_at",
        target,
        alias,
      );
      await db.runAsync("DELETE FROM revision_items WHERE item_id=?", alias);
    }
    await db.runAsync(
      "INSERT OR REPLACE INTO metadata VALUES (?,?)",
      "source_catalog",
      JSON.stringify(data.sources ?? []),
    );
    await db.runAsync(
      "INSERT OR REPLACE INTO metadata VALUES (?,?)",
      "dataset_version",
      String(data.version),
    );
    await db.runAsync(
      "INSERT OR REPLACE INTO metadata VALUES (?,?)",
      "dataset_fingerprint",
      data.fingerprint ?? "",
    );
  });
}
export async function initializeDatabase(db: SQLiteDatabase, data: unknown) {
  await db.execAsync("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((row?.user_version ?? 0) > 2)
    throw new Error("This database needs a newer app version.");
  await db.execAsync(migration);
  const validated = validateDataset(data);
  const version = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM metadata WHERE key=?",
    "dataset_version",
  );
  const fingerprint = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM metadata WHERE key=?",
    "dataset_fingerprint",
  );
  if (
    version?.value !== String(validated.version) ||
    fingerprint?.value !== (validated.fingerprint ?? "")
  )
    await importDataset(db, validated);
}
