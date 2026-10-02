export const CONTENT_TYPES = [
  "formula",
  "short_note",
  "definition",
  "theorem",
  "shortcut",
  "important_fact",
  "law",
  "identity",
  "standard_result",
  "rule",
  "property",
  "principle",
  "concept",
  "reaction",
  "named_reaction",
  "reagent_note",
  "conversion",
  "mechanism_note",
  "trend",
  "exception",
  "table",
  "graph",
  "diagram_reference",
  "map_reference",
  "accounting_entry",
  "comparison",
  "timeline",
  "thinker_theory",
  "common_trap",
  "example",
  "content_reference",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export interface SourceVariant {
  sourceId: string;
  files: string[];
  record: Record<string, unknown>;
}
export interface Provenance {
  sourceVariants?: SourceVariant[];
  needsReview?: boolean;
  reviewReasons?: string[];
  placements?: Mappings[];
}
export type Difficulty = "easy" | "medium" | "hard";
export interface Entity {
  id: string;
  name: string;
  order?: number;
  description?: string;
  needsReview?: boolean;
  placements?: Mappings[];
}
export interface Chapter extends Entity {
  subjectId: string;
}
export interface Topic extends Entity {
  chapterId: string;
}
export interface Mappings {
  classes: string[];
  exams: string[];
  subjects: string[];
  chapters: string[];
  topics: string[];
  boards: string[];
  streams: string[];
}
export interface ContentItem extends Mappings, Provenance {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  formula: string;
  summary: string;
  body: { heading: string; bullets: string[] }[];
  explanation: string;
  example: string;
  whenToUse: string;
  commonMistake: string;
  variables: { symbol: string; meaning: string; unit: string }[];
  units: string[];
  keywords: string[];
  tags: string[];
  difficulty: Difficulty;
  importance: number;
  relatedIds: string[];
  formulaLatex?: string;
  details?: Record<string, unknown>;
}
export interface Question extends Mappings, Provenance {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  linkedContentIds: string[];
  difficulty: Difficulty;
}
export interface FormulaSheet extends Mappings {
  id: string;
  title: string;
  description: string;
  contentIds: string[];
}
export interface Dataset {
  version: number;
  fingerprint?: string;
  classes: Entity[];
  exams: Entity[];
  boards: Entity[];
  streams: Entity[];
  subjects: Entity[];
  chapters: Chapter[];
  topics: Topic[];
  content: ContentItem[];
  questions: Question[];
  sheets: FormulaSheet[];
  sources?: {
    file: string;
    sha256: string;
    metadata: Record<string, unknown>;
    validation: unknown;
    catalog?: Record<string, unknown>;
  }[];
  contentAliases?: Record<string, string>;
}
export interface Preferences {
  completed: boolean;
  mode: "school" | "competitive";
  classId: string;
  examId: string;
  boardId: string;
  streamId: string;
  subjectIds: string[];
}
export interface ContentFilter {
  mode?: "school" | "competitive";
  classId?: string;
  examId?: string;
  boardId?: string;
  streamId?: string;
  subjectIds?: string[];
  chapterId?: string;
  topicId?: string;
  type?: ContentType;
  query?: string;
  limit?: number;
  offset?: number;
}
export interface TestConfig extends ContentFilter {
  count: number;
  difficulty: Difficulty | "mixed";
}
export interface Attempt {
  id: string;
  questions: Question[];
  answers: Record<string, number>;
  finished: boolean;
  createdAt: number;
  completedAt?: number;
}
