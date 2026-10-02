import type { SQLiteDatabase, SQLiteBindValue } from "expo-sqlite";
import type {
  Attempt,
  ContentFilter,
  ContentItem,
  Entity,
  FormulaSheet,
  Question,
  TestConfig,
} from "../types/content";

export function filterSql(
  filter: ContentFilter,
  kind = "content",
  alias = "c",
  placement?: string,
) {
  const clauses: string[] = [];
  const params: SQLiteBindValue[] = [];
  const requirements: [string, string[]][] = [];
  const add = (key: string, values: string[]) => {
    if (values.length) requirements.push([key, values]);
  };
  if (filter.mode === "school") {
    if (filter.classId) add("classes", [filter.classId]);
    if (filter.boardId) add("boards", [filter.boardId]);
    if (filter.streamId) add("streams", [filter.streamId]);
  }
  if (filter.mode === "competitive" && filter.examId)
    add("exams", [filter.examId]);
  if (filter.subjectIds?.length) add("subjects", filter.subjectIds);
  if (filter.chapterId) add("chapters", [filter.chapterId]);
  if (filter.topicId) add("topics", [filter.topicId]);
  if (requirements.length) {
    const checks = requirements.map(([key, values]) => {
      params.push(key, ...values);
      return `EXISTS (SELECT 1 FROM placement_mappings pm WHERE pm.owner_kind=p.owner_kind AND pm.owner_id=p.owner_id AND pm.placement=p.placement AND pm.kind=? AND pm.target_id IN (${values.map(() => "?").join(",")}))`;
    });
    params.unshift(kind);
    clauses.push(
      `EXISTS (SELECT 1 FROM placement_mappings p WHERE p.owner_kind=? AND p.owner_id=${alias}.id ${placement ? `AND p.placement=${placement}` : ""} AND ${checks.join(" AND ")})`,
    );
  }
  if (kind === "content" && filter.type) {
    clauses.push(`${alias}.type=?`);
    params.push(filter.type);
  }
  if (kind === "content" && filter.query?.trim())
    for (const word of filter.query.trim().toLowerCase().split(/\s+/)) {
      clauses.push(`${alias}.search_text LIKE ? ESCAPE '\\'`);
      params.push(`%${word.replace(/[\\%_]/g, "\\$&")}%`);
    }
  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}
const decode = <T>(rows: { data: string }[]) =>
  rows.map((r) => JSON.parse(r.data) as T);
export class Repository {
  constructor(public db: SQLiteDatabase) {}
  async content(filter: ContentFilter = {}) {
    const { where, params } = filterSql(filter);
    return decode<ContentItem>(
      await this.db.getAllAsync<{ data: string }>(
        `SELECT c.data FROM content c ${where} ORDER BY c.title LIMIT ? OFFSET ?`,
        ...params,
        filter.limit ?? 100,
        filter.offset ?? 0,
      ),
    );
  }
  async item(id: string) {
    id = await this.canonicalId(id);
    const row = await this.db.getFirstAsync<{ data: string }>(
      "SELECT data FROM content WHERE id=?",
      id,
    );
    return row ? (JSON.parse(row.data) as ContentItem) : null;
  }
  async entities(kind: string, parent?: string): Promise<Entity[]> {
    return this.db.getAllAsync<Entity>(
      `SELECT id,name FROM entities WHERE kind=? ${parent ? "AND parent_id=?" : ""} ORDER BY name`,
      ...(parent ? [kind, parent] : [kind]),
    );
  }
  async availableEntities(
    kind: "subjects" | "chapters" | "topics",
    filter: ContentFilter,
  ) {
    const direct = filterSql(
      { ...filter, type: undefined, query: undefined },
      kind,
      "e",
    );
    const fromContent = filterSql(
      { ...filter, type: undefined, query: undefined },
      "content",
      "c",
      "m.placement",
    );
    return this.db.getAllAsync<Entity>(
      `SELECT e.id,e.name FROM entities e ${direct.where || "WHERE 1=1"} AND e.kind=?
       UNION
       SELECT DISTINCT e.id,e.name FROM entities e JOIN placement_mappings m ON m.kind=e.kind AND m.target_id=e.id AND m.owner_kind='content' JOIN content c ON c.id=m.owner_id ${fromContent.where || "WHERE 1=1"} AND e.kind=? ORDER BY name`,
      ...direct.params,
      kind,
      ...fromContent.params,
      kind,
    );
  }
  async contentTypes() {
    return (
      await this.db.getAllAsync<{
        type: import("../types/content").ContentType;
      }>("SELECT DISTINCT type FROM content ORDER BY type")
    ).map((r) => r.type);
  }
  async canonicalId(id: string) {
    return (
      (
        await this.db.getFirstAsync<{ content_id: string }>(
          "SELECT content_id FROM content_aliases WHERE alias=?",
          id,
        )
      )?.content_id ?? id
    );
  }
  async sheets(filter: ContentFilter) {
    const { where, params } = filterSql(filter, "sheet", "c");
    return decode<FormulaSheet>(
      await this.db.getAllAsync<{ data: string }>(
        `SELECT c.data FROM formula_sheets c ${where} ORDER BY c.title`,
        ...params,
      ),
    );
  }
  async sheet(id: string) {
    const r = await this.db.getFirstAsync<{ data: string }>(
      "SELECT data FROM formula_sheets WHERE id=?",
      id,
    );
    return r ? (JSON.parse(r.data) as FormulaSheet) : null;
  }
  async bookmarkIds(kind = "content") {
    return (
      await this.db.getAllAsync<{ item_id: string }>(
        "SELECT item_id FROM bookmarks WHERE kind=? ORDER BY created_at DESC",
        kind,
      )
    ).map((r) => r.item_id);
  }
  async toggleBookmark(id: string, kind = "content") {
    if (kind === "content") id = await this.canonicalId(id);
    const r = await this.db.getFirstAsync(
      "SELECT 1 FROM bookmarks WHERE kind=? AND item_id=?",
      kind,
      id,
    );
    if (r)
      await this.db.runAsync(
        "DELETE FROM bookmarks WHERE kind=? AND item_id=?",
        kind,
        id,
      );
    else
      await this.db.runAsync(
        "INSERT INTO bookmarks VALUES (?,?,?)",
        kind,
        id,
        Date.now(),
      );
  }
  async recent(id: string) {
    id = await this.canonicalId(id);
    await this.db.runAsync(
      "INSERT OR REPLACE INTO recent_items VALUES (?,?)",
      id,
      Date.now(),
    );
    await this.db.execAsync(
      "DELETE FROM recent_items WHERE item_id NOT IN (SELECT item_id FROM recent_items ORDER BY viewed_at DESC LIMIT 30)",
    );
  }
  async revision(id: string, status: "revision" | "learned" | null) {
    id = await this.canonicalId(id);
    if (status)
      await this.db.runAsync(
        "INSERT OR REPLACE INTO revision_items VALUES (?,?,?)",
        id,
        status,
        Date.now(),
      );
    else
      await this.db.runAsync("DELETE FROM revision_items WHERE item_id=?", id);
  }
  async status(id: string) {
    id = await this.canonicalId(id);
    return (
      (
        await this.db.getFirstAsync<{ status: "revision" | "learned" }>(
          "SELECT status FROM revision_items WHERE item_id=?",
          id,
        )
      )?.status ?? null
    );
  }
  async collection(
    kind: "bookmarks" | "recent" | "revision" | "learned",
    filter: ContentFilter = {},
  ) {
    const { where, params } = filterSql(filter);
    const join =
      kind === "bookmarks"
        ? "JOIN bookmarks b ON b.item_id=c.id AND b.kind='content'"
        : kind === "recent"
          ? "JOIN recent_items b ON b.item_id=c.id"
          : `JOIN revision_items b ON b.item_id=c.id AND b.status='${kind === "learned" ? "learned" : "revision"}'`;
    const order =
      kind === "recent"
        ? "b.viewed_at"
        : kind === "bookmarks"
          ? "b.created_at"
          : "b.updated_at";
    return decode<ContentItem>(
      await this.db.getAllAsync<{ data: string }>(
        `SELECT c.data FROM content c ${join} ${where} ORDER BY ${order} DESC LIMIT ? OFFSET ?`,
        ...params,
        filter.limit ?? 100,
        filter.offset ?? 0,
      ),
    );
  }
  async createTest(config: TestConfig): Promise<Attempt | null> {
    const { where, params } = filterSql(config, "question");
    const extra =
      config.difficulty === "mixed"
        ? ""
        : `${where ? "AND" : "WHERE"} c.difficulty=?`;
    const rows = await this.db.getAllAsync<{ data: string }>(
      `SELECT c.data FROM questions c ${where} ${extra} ORDER BY RANDOM() LIMIT ?`,
      ...params,
      ...(config.difficulty === "mixed" ? [] : [config.difficulty]),
      config.count,
    );
    const questions = decode<Question>(rows);
    if (!questions.length) return null;
    const attempt: Attempt = {
      id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      questions,
      answers: {},
      finished: false,
      createdAt: Date.now(),
    };
    await this.saveAttempt(attempt);
    return attempt;
  }
  async saveAttempt(a: Attempt) {
    await this.db.runAsync(
      "INSERT OR REPLACE INTO test_attempts VALUES (?,?,?)",
      a.id,
      JSON.stringify(a),
      a.createdAt,
    );
  }
  async attempt(id: string) {
    const r = await this.db.getFirstAsync<{ data: string }>(
      "SELECT data FROM test_attempts WHERE id=?",
      id,
    );
    return r ? (JSON.parse(r.data) as Attempt) : null;
  }
  async attempts() {
    return decode<Attempt>(
      await this.db.getAllAsync<{ data: string }>(
        "SELECT data FROM test_attempts ORDER BY created_at DESC LIMIT 20",
      ),
    );
  }
}
