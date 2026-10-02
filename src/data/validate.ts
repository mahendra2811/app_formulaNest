import type {
  ContentType,
  Dataset,
  Difficulty,
  Mappings,
} from "../types/content";
import { CONTENT_TYPES } from "../types/content.ts";
const difficulties: Difficulty[] = ["easy", "medium", "hard"];
const mappingKeys = [
  "classes",
  "exams",
  "subjects",
  "chapters",
  "topics",
  "boards",
  "streams",
] as const;
const entityGroups = [
  "classes",
  "exams",
  "boards",
  "streams",
  "subjects",
  "chapters",
  "topics",
  "content",
  "questions",
  "sheets",
] as const;

export class DatasetValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      `Dataset validation failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
    );
    this.name = "DatasetValidationError";
    this.issues = issues;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function nonEmpty(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function hasStringArrayFields(
  value: unknown,
  keys: readonly string[],
): boolean {
  return isRecord(value) && keys.every((key) => strings(value[key]));
}

function validBody(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (section) =>
        isRecord(section) &&
        nonEmpty(section.heading) &&
        Array.isArray(section.bullets) &&
        section.bullets.every(nonEmpty),
    )
  );
}

function validVariables(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (variable) =>
        isRecord(variable) &&
        nonEmpty(variable.symbol) &&
        nonEmpty(variable.meaning) &&
        isString(variable.unit),
    )
  );
}

function addRequiredStringIssues(
  record: Record<string, unknown>,
  keys: string[],
  path: string,
  issues: string[],
) {
  for (const key of keys) {
    if (!nonEmpty(record[key]))
      issues.push(`${path}.${key} must be a non-empty string`);
  }
}

/** Validate an untrusted content payload and return it with the Dataset type. */
export function validateDataset(input: unknown): Dataset {
  const issues: string[] = [];
  if (!isRecord(input))
    throw new DatasetValidationError(["dataset must be an object"]);

  if (!Number.isInteger(input.version) || (input.version as number) < 1) {
    issues.push("version must be a positive integer");
  }
  for (const group of entityGroups) {
    if (!Array.isArray(input[group])) issues.push(`${group} must be an array`);
  }
  if (issues.length) throw new DatasetValidationError(issues);

  const groups = Object.fromEntries(
    entityGroups.map((group) => [group, input[group] as unknown[]]),
  ) as Record<(typeof entityGroups)[number], unknown[]>;
  const ids = {} as Record<(typeof entityGroups)[number], Set<string>>;
  for (const group of entityGroups) {
    ids[group] = new Set<string>();
    groups[group].forEach((entry, index) => {
      const path = `${group}[${index}]`;
      if (!isRecord(entry)) {
        issues.push(`${path} must be an object`);
        return;
      }
      if (!nonEmpty(entry.id)) {
        issues.push(`${path}.id must be a non-empty string`);
      } else if (ids[group].has(entry.id)) {
        issues.push(`${path}.id duplicates "${entry.id}" in ${group}`);
      } else {
        ids[group].add(entry.id);
      }
      if (
        [
          "classes",
          "exams",
          "boards",
          "streams",
          "subjects",
          "chapters",
          "topics",
        ].includes(group)
      ) {
        addRequiredStringIssues(entry, ["name"], path, issues);
      }
      if (group === "chapters" && !nonEmpty(entry.subjectId))
        issues.push(`${path}.subjectId must be a non-empty string`);
      if (group === "topics" && !nonEmpty(entry.chapterId))
        issues.push(`${path}.chapterId must be a non-empty string`);
    });
  }

  const chapterSubject = new Map<string, string>();
  for (const [index, chapter] of groups.chapters.entries()) {
    if (
      isRecord(chapter) &&
      nonEmpty(chapter.id) &&
      nonEmpty(chapter.subjectId)
    ) {
      chapterSubject.set(chapter.id, chapter.subjectId);
      if (!ids.subjects.has(chapter.subjectId))
        issues.push(
          `chapters[${index}].subjectId references missing subject "${chapter.subjectId}"`,
        );
    }
  }
  const topicChapter = new Map<string, string>();
  for (const [index, topic] of groups.topics.entries()) {
    if (isRecord(topic) && nonEmpty(topic.id) && nonEmpty(topic.chapterId)) {
      topicChapter.set(topic.id, topic.chapterId);
      if (!ids.chapters.has(topic.chapterId))
        issues.push(
          `topics[${index}].chapterId references missing chapter "${topic.chapterId}"`,
        );
    }
  }

  const contentIds = ids.content;
  for (const [index, item] of groups.content.entries()) {
    const path = `content[${index}]`;
    if (!isRecord(item)) continue;
    addRequiredStringIssues(
      item,
      ["type", "title", "slug", "summary", "explanation"],
      path,
      issues,
    );
    if (!CONTENT_TYPES.includes(item.type as ContentType))
      issues.push(`${path}.type is not a supported content type`);
    for (const field of ["formula", "example", "whenToUse", "commonMistake"]) {
      if (!isString(item[field]))
        issues.push(`${path}.${field} must be a string`);
    }
    if (item.type === "formula")
      addRequiredStringIssues(item, ["formula", "example"], path, issues);
    if (
      item.type === "short_note" &&
      (!Array.isArray(item.body) || item.body.length === 0)
    ) {
      issues.push(
        `${path}.body must contain at least one section for a short note`,
      );
    }
    if (
      item.type === "short_note" &&
      Array.isArray(item.body) &&
      !item.body.some(
        (section) =>
          isRecord(section) &&
          Array.isArray(section.bullets) &&
          section.bullets.some(nonEmpty),
      )
    ) {
      issues.push(
        `${path}.body must contain at least one substantive bullet for a short note`,
      );
    }
    if (!difficulties.includes(item.difficulty as Difficulty))
      issues.push(`${path}.difficulty must be easy, medium, or hard`);
    if (
      !Number.isInteger(item.importance) ||
      (item.importance as number) < 1 ||
      (item.importance as number) > 5
    ) {
      issues.push(`${path}.importance must be an integer from 1 to 5`);
    }
    if (!validBody(item.body))
      issues.push(
        `${path}.body must contain sections with headings and string bullets`,
      );
    if (!validVariables(item.variables))
      issues.push(
        `${path}.variables must contain symbol, meaning, and unit strings`,
      );
    if (
      !strings(item.units) ||
      !strings(item.keywords) ||
      !strings(item.tags) ||
      !strings(item.relatedIds)
    ) {
      issues.push(
        `${path} units, keywords, tags, and relatedIds must be string arrays`,
      );
    }
    if (!hasStringArrayFields(item, mappingKeys)) {
      issues.push(`${path} must contain string-array audience mappings`);
      continue;
    }
    const mappings = item as unknown as Mappings;
    for (const key of mappingKeys) {
      const group = (
        {
          classes: "classes",
          exams: "exams",
          subjects: "subjects",
          chapters: "chapters",
          topics: "topics",
          boards: "boards",
          streams: "streams",
        } as const
      )[key];
      for (const reference of mappings[key]) {
        if (!ids[group].has(reference))
          issues.push(
            `${path}.${key} references missing ${key.slice(0, -1)} "${reference}"`,
          );
      }
    }
    for (const relatedId of strings(item.relatedIds) ? item.relatedIds : []) {
      if (!contentIds.has(relatedId))
        issues.push(
          `${path}.relatedIds references missing content "${relatedId}"`,
        );
    }
    if (strings(item.chapters) && strings(item.subjects)) {
      for (const chapterId of item.chapters) {
        const subjectId = chapterSubject.get(chapterId);
        if (subjectId && !item.subjects.includes(subjectId))
          issues.push(
            `${path}.chapters includes "${chapterId}" without its subject "${subjectId}"`,
          );
      }
    }
    if (strings(item.topics) && strings(item.chapters)) {
      for (const topicId of item.topics) {
        const chapterId = topicChapter.get(topicId);
        if (chapterId && !item.chapters.includes(chapterId))
          issues.push(
            `${path}.topics includes "${topicId}" without its chapter "${chapterId}"`,
          );
      }
    }
  }

  for (const [index, question] of groups.questions.entries()) {
    const path = `questions[${index}]`;
    if (!isRecord(question)) continue;
    addRequiredStringIssues(
      question,
      ["question", "explanation"],
      path,
      issues,
    );
    if (!difficulties.includes(question.difficulty as Difficulty))
      issues.push(`${path}.difficulty must be easy, medium, or hard`);
    if (
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !question.options.every(nonEmpty)
    ) {
      issues.push(
        `${path}.options must contain exactly four non-empty strings`,
      );
    }
    if (
      !Number.isInteger(question.correctAnswer) ||
      (question.correctAnswer as number) < 0 ||
      (question.correctAnswer as number) > 3
    ) {
      issues.push(`${path}.correctAnswer must be an integer from 0 to 3`);
    }
    if (!strings(question.linkedContentIds)) {
      issues.push(`${path}.linkedContentIds must be a string array`);
    } else {
      for (const id of question.linkedContentIds) {
        if (!contentIds.has(id))
          issues.push(
            `${path}.linkedContentIds references missing content "${id}"`,
          );
      }
    }
    if (!hasStringArrayFields(question, mappingKeys)) {
      issues.push(`${path} must contain string-array audience mappings`);
      continue;
    }
    for (const key of mappingKeys) {
      for (const reference of question[key] as string[]) {
        if (!ids[key].has(reference))
          issues.push(
            `${path}.${key} references missing ${key.slice(0, -1)} "${reference}"`,
          );
      }
    }
  }

  for (const [index, sheet] of groups.sheets.entries()) {
    const path = `sheets[${index}]`;
    if (!isRecord(sheet)) continue;
    addRequiredStringIssues(sheet, ["title", "description"], path, issues);
    if (!strings(sheet.contentIds)) {
      issues.push(`${path}.contentIds must be a string array`);
    } else {
      for (const id of sheet.contentIds) {
        if (!contentIds.has(id))
          issues.push(`${path}.contentIds references missing content "${id}"`);
      }
    }
    if (!hasStringArrayFields(sheet, mappingKeys)) {
      issues.push(`${path} must contain string-array audience mappings`);
      continue;
    }
    for (const key of mappingKeys) {
      for (const reference of sheet[key] as string[]) {
        if (!ids[key].has(reference))
          issues.push(
            `${path}.${key} references missing ${key.slice(0, -1)} "${reference}"`,
          );
      }
    }
  }

  if (issues.length) throw new DatasetValidationError(issues);
  for (const group of entityGroups) {
    for (const entry of groups[group]) {
      if (!isRecord(entry) || entry.placements === undefined) continue;
      if (!Array.isArray(entry.placements)) {
        issues.push(`${group}.${String(entry.id)}.placements must be an array`);
        continue;
      }
      for (const scope of entry.placements) {
        if (!isRecord(scope) || !hasStringArrayFields(scope, mappingKeys)) {
          issues.push(
            `${group}.${String(entry.id)} has invalid placement mappings`,
          );
          continue;
        }
        for (const key of mappingKeys)
          for (const id of scope[key] as string[]) {
            if (!ids[key].has(id))
              issues.push(
                `${group}.${String(entry.id)} placement references missing ${key}: ${id}`,
              );
          }
      }
    }
  }
  if (input.contentAliases !== undefined) {
    if (!isRecord(input.contentAliases))
      issues.push("contentAliases must be an object");
    else
      for (const [alias, target] of Object.entries(input.contentAliases)) {
        if (
          typeof target !== "string" ||
          !contentIds.has(target) ||
          alias === target
        )
          issues.push(`Invalid content alias ${alias}`);
      }
  }
  if (issues.length) throw new DatasetValidationError(issues);
  return input as unknown as Dataset;
}
