import { CONTENT_TYPES } from "../types/content.ts";
import type {
  ContentItem,
  ContentType,
  Dataset,
  Entity,
  Mappings,
  Question,
  SourceVariant,
} from "../types/content.ts";
import { validateDataset } from "./validate.ts";

export interface SourceInput {
  file: string;
  sha256: string;
  data: unknown;
}
type Raw = Record<string, unknown>;
const keys = [
  "classes",
  "exams",
  "subjects",
  "chapters",
  "topics",
  "boards",
  "streams",
] as const;
export const canonicalAliases: Record<string, string> = {
  math_quadratic_formula: "math_quadratic_roots",
  physics_faradays_law: "physics_faraday_law",
  physics_ideal_gas_pressure: "chemistry_ideal_gas",
  "formula-01": "math_quadratic_roots",
  "formula-02": "math_quadratic_discriminant",
  "formula-21": "physics_ohms_law",
  "formula-25": "physics_electric_power",
  "formula-26": "physics_drift_current",
  "formula-27": "physics_coulombs_law",
  "formula-28": "physics_electric_field",
};
const record = (v: unknown): Raw =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {};
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
const strings = (v: unknown): string[] => list(v).map(text).filter(Boolean);
const unique = <T>(v: T[]): T[] => Array.from(new Set(v));
const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const human = (v: string) => v.replaceAll("_", " ").replaceAll("-", " ");
const nonEmptyRecord = (v: Raw) => Object.keys(v).length > 0;
const serial = (v: unknown): string =>
  typeof v === "string"
    ? v
    : Array.isArray(v)
      ? v.map(serial).filter(Boolean).join(" · ")
      : nonEmptyRecord(record(v))
        ? Object.entries(record(v))
            .map(([k, val]) => `${human(k)}: ${serial(val)}`)
            .join("; ")
        : text(v);
const blank = (): Mappings => ({
  classes: [],
  exams: [],
  subjects: [],
  chapters: [],
  topics: [],
  boards: [],
  streams: [],
});
const mergeMappings = (left: Mappings, right: Mappings) => {
  for (const key of keys) left[key] = unique([...left[key], ...right[key]]);
};
const mergePlacements = (a: Mappings[], b: Mappings[]) => {
  const map = new Map([...a, ...b].map((p) => [JSON.stringify(p), p]));
  return [...map.values()];
};
const normalizeClass = (v: unknown) => {
  const n = text(v).match(/(?:class[_ -]?)?(\d+)$/)?.[1];
  return n ? `class-${n}` : text(v);
};
const normalizeStream = (v: unknown) => {
  const s = slug(text(v));
  return ["arts", "humanities", "humanities-arts"].includes(s) ? "arts" : s;
};
const normalizeExam = (v: unknown) => slug(text(v));

export function normalizeSources(inputs: SourceInput[], sample: Dataset) {
  const data: Dataset = {
    version: 2,
    classes: structuredClone(sample.classes),
    boards: structuredClone(sample.boards),
    streams: structuredClone(sample.streams),
    exams: structuredClone(sample.exams),
    subjects: [],
    chapters: [],
    topics: [],
    content: [],
    questions: [],
    sheets: [],
    sources: [],
    contentAliases: {},
  };
  const entities = new Map<string, Entity>();
  const subjectAliases = new Map<string, string>();
  const subjectScopes = new Map<string, Mappings[]>();
  const variants = new Map<string, SourceVariant[]>();
  const references = new Map<string, SourceVariant[]>();
  const metadataByFile = new Map<string, Raw>();
  const report = {
    sourceFiles: [] as {
      file: string;
      sha256: string;
      category: string;
      metadata: Raw;
      validation: unknown;
      catalog: Raw;
    }[],
    sourceRecordOccurrences: 0,
    uniqueSourceRecords: 0,
    exactDuplicateOccurrences: 0,
    variantRecords: [] as string[],
    resolvedReferences: [] as { id: string; target: string }[],
    unresolvedReferences: [] as { id: string; target: string }[],
    normalizationNotes: [] as string[],
    coverage: [] as {
      classId?: string;
      examId?: string;
      streamId?: string;
      subjectId: string;
      content: number;
      questions: number;
    }[],
    counts: {} as Record<string, number>,
    missingOutputs: [
      "AI9: no dedicated JEE Main Chemistry JSON response was supplied.",
    ],
  };
  const addEntity = (
    kind: "subjects" | "chapters" | "topics",
    e: Entity & { subjectId?: string; chapterId?: string },
  ) => {
    const key = `${kind}:${e.id}`;
    const prior = entities.get(key);
    if (prior && prior.name !== e.name)
      throw new Error(
        `Conflicting ${kind} names for ${e.id}: ${prior.name} / ${e.name}`,
      );
    entities.set(key, {
      ...prior,
      ...e,
      placements: mergePlacements(prior?.placements ?? [], e.placements ?? []),
    });
  };
  const inferSubject = (id: string) => {
    if (subjectAliases.has(id)) return subjectAliases.get(id)!;
    let name = id
      .replace(/^cbse_class\d+_/, "")
      .replace(/^jee_main_/, "")
      .replace(/^math$/, "mathematics");
    if (name === "math") name = "mathematics";
    return slug(name);
  };
  const remember = (file: string, r: Raw) => {
    if (!text(r.id)) throw new Error(`${file}: record without an id`);
    const id = text(r.id);
    const store = ["formula_reference", "content_reference"].includes(
      text(r.type),
    )
      ? references
      : variants;
    const existing = store.get(id) ?? [];
    const signature = JSON.stringify(r);
    const exact = existing.find((v) => JSON.stringify(v.record) === signature);
    report.sourceRecordOccurrences++;
    if (exact) {
      exact.files = unique([...exact.files, file]);
      report.exactDuplicateOccurrences++;
    } else {
      existing.push({ sourceId: id, files: [file], record: r });
      store.set(id, existing);
    }
  };

  for (const input of inputs) {
    const root = record(input.data);
    const meta = record(root.metadata);
    metadataByFile.set(input.file, meta);
    const category = Array.isArray(input.data)
      ? "record-list"
      : Array.isArray(root.content)
        ? "dataset"
        : Array.isArray(root.files)
          ? "manifest"
          : text(root.canonical_source)
            ? "audience-mapping"
            : "validation-report";
    const catalog = Object.fromEntries(
      Object.entries(root).filter(
        ([key]) =>
          ![
            "content",
            "questions",
            "formula_references",
            "content_references",
          ].includes(key),
      ),
    );
    report.sourceFiles.push({
      file: input.file,
      sha256: input.sha256,
      category,
      metadata: meta,
      validation:
        root.validation ?? (category === "validation-report" ? root : null),
      catalog,
    });
    data.sources!.push({
      file: input.file,
      sha256: input.sha256,
      metadata: meta,
      validation:
        root.validation ?? (category === "validation-report" ? root : null),
      catalog,
    });
    for (const s of [
      ...list(root.subjects),
      ...(nonEmptyRecord(record(root.subject)) ? [root.subject] : []),
    ]) {
      const r = record(s);
      const id = text(r.id);
      const name = text(r.name);
      if (!id || !name) throw new Error(`${input.file}: invalid subject`);
      const normalized = slug(name);
      subjectAliases.set(id, normalized);
      const scope = blank();
      scope.subjects = [normalized];
      const cls =
        text(r.class_id) ||
        text(meta.class) ||
        id.match(/^cbse_class(\d+)_/)?.[1];
      if (cls) scope.classes = [normalizeClass(cls)];
      const exam = text(record(root.exam).id) || text(meta.exam);
      if (exam) scope.exams = [normalizeExam(exam)];
      if (scope.classes.length) scope.boards = ["cbse"];
      const stream = text(r.stream) || text(meta.stream);
      if (stream) scope.streams = [normalizeStream(stream)];
      subjectScopes.set(
        id,
        mergePlacements(subjectScopes.get(id) ?? [], [scope]),
      );
      addEntity("subjects", { id: normalized, name, placements: [scope] });
    }
  }
  for (const input of inputs) {
    const root = record(input.data);
    for (const c of list(root.chapters)) {
      const r = record(c);
      addEntity("chapters", {
        id: text(r.id),
        name: text(r.name),
        subjectId: inferSubject(text(r.subject_id)),
        order: typeof r.order === "number" ? r.order : undefined,
        description: text(r.description),
        needsReview: r.needs_review === true,
        placements: (subjectScopes.get(text(r.subject_id)) ?? []).map((p) => ({
          ...p,
          chapters: [text(r.id)],
        })),
      });
    }
    for (const t of list(root.topics)) {
      const r = record(t);
      addEntity("topics", {
        id: text(r.id),
        name: text(r.name),
        chapterId: text(r.chapter_id),
        order: typeof r.order === "number" ? r.order : undefined,
        placements: (
          entities.get(`chapters:${text(r.chapter_id)}`)?.placements ?? []
        ).map((p) => ({ ...p, topics: [text(r.id)] })),
      });
    }
    const items = Array.isArray(input.data)
      ? input.data
      : [
          ...list(root.content),
          ...list(root.questions),
          ...list(root.formula_references),
          ...list(root.content_references),
        ];
    for (const item of items) {
      const r = record(item);
      if (!nonEmptyRecord(r)) throw new Error(`${input.file}: invalid record`);
      remember(input.file, r);
    }
  }
  for (const subject of sample.subjects) addEntity("subjects", subject);
  const chapterAliases: Record<string, string> = {
    "quadratic-equations": "cbse_class10_mathematics_4",
    trigonometry: "cbse_class10_mathematics_8",
    "current-electricity": "cbse_class12_physics_3",
    electrostatics: "cbse_class12_physics_1",
  };
  const sampleChapter = (chapter: string, topic?: string) =>
    topic === "electric-potential"
      ? "cbse_class12_physics_2"
      : (chapterAliases[chapter] ?? chapter);
  for (const chapter of sample.chapters)
    if (!entities.has(`chapters:${chapterAliases[chapter.id]}`))
      addEntity("chapters", chapter);
  for (const topic of sample.topics) {
    const chapterId = sampleChapter(topic.chapterId, topic.id);
    addEntity("topics", {
      ...topic,
      chapterId,
      placements: (entities.get(`chapters:${chapterId}`)?.placements ?? []).map(
        (p) => ({ ...p, topics: [topic.id] }),
      ),
    });
  }
  const sampleScope = (original: Mappings): Mappings => ({
    ...(Object.fromEntries(
      keys.map((k) => [k, [...original[k]]]),
    ) as unknown as Mappings),
    chapters: unique(
      original.chapters.map((id) => sampleChapter(id, original.topics[0])),
    ),
  });
  const placement = (r: Raw, files: string[]): Mappings => {
    const p = blank();
    const chapter = text(r.chapter_id);
    const topic = text(r.topic_id);
    let subject = text(r.subject_id);
    if (!subject && chapter)
      subject = text(
        (entities.get(`chapters:${chapter}`) as { subjectId?: string })
          ?.subjectId,
      );
    if (subject) p.subjects = [inferSubject(subject)];
    if (chapter) p.chapters = [chapter];
    if (topic) p.topics = [topic];
    const meta = metadataByFile.get(files[0]) ?? {};
    p.classes = unique(strings(r.classes).map(normalizeClass));
    if (!p.classes.length && /^cbse_class(\d+)_/.test(text(r.subject_id)))
      p.classes = [
        normalizeClass(text(r.subject_id).match(/^cbse_class(\d+)_/)![1]),
      ];
    p.exams = unique(
      [...strings(r.exams), ...(text(r.exam) ? [text(r.exam)] : [])].map(
        normalizeExam,
      ),
    );
    p.boards = unique(strings(r.boards).map((v) => slug(v)));
    if (p.classes.length && !p.boards.length)
      p.boards = [slug(text(meta.board) || "CBSE")];
    p.streams = unique(strings(r.streams).map(normalizeStream));
    if (
      p.classes.some((c) => ["class-11", "class-12"].includes(c)) &&
      !p.streams.length &&
      meta.stream
    )
      p.streams = [normalizeStream(meta.stream)];
    if (!p.subjects.length && files[0].includes("jee_main_math"))
      p.subjects = ["mathematics"];
    if (!p.subjects.length && files[0].includes("jee_main_physics"))
      p.subjects = ["physics"];
    if (!p.subjects.length)
      throw new Error(`Cannot determine subject for ${text(r.id)}`);
    for (const id of p.subjects)
      if (!entities.has(`subjects:${id}`))
        addEntity("subjects", {
          id,
          name: human(id).replace(/\b\w/g, (c) => c.toUpperCase()),
        });
    for (const id of p.chapters)
      if (!entities.has(`chapters:${id}`))
        throw new Error(`Missing chapter ${id} for ${text(r.id)}`);
    for (const id of p.topics)
      if (!entities.has(`topics:${id}`))
        throw new Error(`Missing topic ${id} for ${text(r.id)}`);
    return p;
  };
  const content = new Map<string, ContentItem>();
  const questions = new Map<string, Question>();
  const bodyFrom = (r: Raw): ContentItem["body"] => {
    const body: ContentItem["body"] = [];
    for (const s of list(r.sections)) {
      const section = record(s);
      const bullets = unique([
        ...strings(section.points),
        ...strings(section.bullets),
      ]);
      if (bullets.length)
        body.push({ heading: text(section.heading) || "Key points", bullets });
    }
    const fields = [
      "conditions",
      "assumptions",
      "must_remember",
      "key_points",
      "important_points",
      "interpretation",
      "limitations_or_cautions",
      "examples",
      "reagents_conditions",
      "reactants",
      "products",
      "labels_required",
      "locations_or_features",
      "do_not_use_when",
      "related_concepts",
      "common_traps",
      "jee_notes",
      "wrong_approach",
      "why_wrong",
      "correct_approach",
      "shortcut",
      "why_it_works",
      "definition",
      "simple_explanation",
      "description",
      "situation",
      "debit_account",
      "credit_account",
      "entry_text",
      "map_scope",
      "thinker",
      "theory_or_concept",
      "x_axis",
      "y_axis",
      "relationship",
      "reaction_type",
    ];
    for (const key of fields) {
      const value = r[key];
      const bullets = Array.isArray(value)
        ? value.map(serial).filter(Boolean)
        : serial(value)
          ? [serial(value)]
          : [];
      if (bullets.length)
        body.push({
          heading: human(key).replace(/^\w/, (c) => c.toUpperCase()),
          bullets,
        });
    }
    return body;
  };
  const mergeContent = (item: ContentItem) => {
    const old = content.get(item.id);
    if (!old) {
      content.set(item.id, item);
      return;
    }
    if (old.type !== item.type)
      throw new Error(`Conflicting content types for ${item.id}`);
    mergeMappings(old, item);
    old.placements = mergePlacements(
      old.placements ?? [old],
      item.placements ?? [item],
    );
    old.sourceVariants = [
      ...(old.sourceVariants ?? []),
      ...(item.sourceVariants ?? []),
    ];
    old.needsReview = old.needsReview || item.needsReview;
    old.reviewReasons = unique([
      ...(old.reviewReasons ?? []),
      ...(item.reviewReasons ?? []),
    ]);
    old.relatedIds = unique([...old.relatedIds, ...item.relatedIds]);
    old.keywords = unique([...old.keywords, ...item.keywords]);
    old.tags = unique([...old.tags, ...item.tags]);
    old.units = unique([...old.units, ...item.units]);
    old.importance = Math.max(old.importance, item.importance);
    old.body = Array.from(
      new Map(
        [...old.body, ...item.body].map((section) => [
          JSON.stringify(section),
          section,
        ]),
      ).values(),
    );
    for (const key of [
      "explanation",
      "example",
      "whenToUse",
      "commonMistake",
    ] as const) {
      if (item[key] && !old[key].includes(item[key]))
        old[key] = [old[key], item[key]].filter(Boolean).join("\n\n");
    }
    old.variables = Array.from(
      new Map(
        [...old.variables, ...item.variables].map((v) => [
          JSON.stringify(v),
          v,
        ]),
      ).values(),
    );
  };
  for (const [id, versions] of variants) {
    if (versions.length > 1) report.variantRecords.push(id);
    for (const v of versions) {
      const r = v.record;
      const p = placement(r, v.files);
      const review = !!r.needs_review;
      const reasons = review
        ? [
            text(r.review_reason) ||
              "The supplied source marks this record for review.",
          ]
        : [];
      if (id === "q_ps_federalism") {
        p.chapters = ["cbse_class11_political_science_7"];
        p.topics = ["cbse_class11_political_science_7_core"];
        reasons.push(
          "Corrected the source's Geography placement to Class 11 Political Science: Federalism.",
        );
      }
      if (r.type === "mcq") {
        const options = list(r.options).map((o) =>
          typeof o === "string" ? o : text(record(o).text),
        );
        const correct = list(r.options).findIndex(
          (o) => text(record(o).id) === text(r.correct_option),
        );
        if (options.length !== 4 || correct < 0 || options.some((o) => !o))
          throw new Error(`Invalid MCQ options/answer: ${id}`);
        const q: Question = {
          ...p,
          id,
          question: text(r.question),
          options,
          correctAnswer: correct,
          explanation: text(r.explanation),
          linkedContentIds: unique([
            ...strings(r.linked_formula_ids),
            ...strings(r.linked_content_ids),
          ]),
          difficulty: (["easy", "medium", "hard"].includes(text(r.difficulty))
            ? r.difficulty
            : "medium") as Question["difficulty"],
          placements: [p],
          sourceVariants: [v],
          needsReview: review || reasons.length > 0,
          reviewReasons: reasons,
        };
        const old = questions.get(id);
        if (old) {
          if (
            old.question !== q.question ||
            JSON.stringify(old.options) !== JSON.stringify(q.options) ||
            old.correctAnswer !== q.correctAnswer
          )
            throw new Error(`Conflicting MCQ answers for ${id}`);
          mergeMappings(old, q);
          old.placements = mergePlacements(old.placements ?? [], [p]);
          old.sourceVariants = [...(old.sourceVariants ?? []), v];
        } else questions.set(id, q);
        continue;
      }
      if (!CONTENT_TYPES.includes(text(r.type) as ContentType))
        throw new Error(
          `Unsupported supplied content type ${text(r.type)}: ${id}`,
        );
      const title = text(r.title) || text(r.name) || text(r.term) || human(id);
      const body = bodyFrom(r);
      const summary =
        text(r.summary) ||
        text(r.definition) ||
        text(r.shortcut) ||
        text(r.description) ||
        text(r.correct_approach) ||
        title;
      const example =
        typeof r.example === "string" ? r.example : serial(r.example);
      const item: ContentItem = {
        ...p,
        id: canonicalAliases[id] ?? id,
        type: r.type as ContentType,
        title,
        slug: slug(title),
        formula: text(r.formula_plain) || text(r.reaction_text),
        formulaLatex: text(r.formula_latex) || text(r.reaction_latex),
        summary,
        body,
        explanation:
          text(r.explanation) ||
          text(r.simple_explanation) ||
          text(r.why_it_works) ||
          summary,
        example,
        whenToUse: text(r.when_to_use),
        commonMistake: strings(r.common_mistakes).join("\n"),
        variables: list(r.variables).map((v) => ({
          symbol: text(record(v).symbol),
          meaning: text(record(v).meaning),
          unit: text(record(v).unit),
        })),
        units: unique([
          ...strings(r.si_units),
          ...list(r.variables)
            .map((v) => text(record(v).unit))
            .filter(Boolean),
        ]),
        keywords: strings(r.keywords),
        tags: strings(r.tags),
        difficulty: (["easy", "medium", "hard"].includes(text(r.difficulty))
          ? r.difficulty
          : "medium") as ContentItem["difficulty"],
        importance: typeof r.importance === "number" ? r.importance : 3,
        relatedIds: unique([
          ...strings(r.related_formula_ids),
          ...strings(r.formula_ids),
          ...strings(r.related_content_ids),
          ...strings(r.related_reaction_ids),
        ]),
        details: r,
        sourceVariants: [v],
        needsReview: review,
        reviewReasons: reasons,
        placements: [p],
      };
      if (item.type === "formula" && !item.variables.length) {
        item.needsReview = true;
        item.reviewReasons!.push(
          "Variable definitions were not supplied for this formula.",
        );
      }
      if (item.type === "short_note" && !body.length) {
        item.body = [{ heading: "Source note", bullets: [summary] }];
        item.needsReview = true;
        item.reviewReasons!.push(
          "The supplied note has no structured sections.",
        );
      }
      if (
        item.summary === "Concise chapter revision note." ||
        body.some((s) =>
          s.bullets.includes(
            "Recall key terms, classifications and principles.",
          ),
        )
      ) {
        item.needsReview = true;
        item.reviewReasons!.push(
          "This is a starter chapter checklist, not a full chapter explanation.",
        );
      }
      if (r.asset_required === true) {
        item.needsReview = true;
        item.reviewReasons!.push(
          "The source describes an illustration or map, but no asset was supplied.",
        );
      }
      mergeContent(item);
    }
  }
  // Retain working sample content and saved IDs; equivalent formulas use supplied canonical IDs.
  for (const original of sample.content) {
    const item = structuredClone(original);
    item.id = content.has(canonicalAliases[item.id])
      ? canonicalAliases[item.id]
      : item.id;
    mergeMappings(item, sampleScope(original));
    item.chapters = sampleScope(original).chapters;
    item.placements = [sampleScope(original)];
    item.sourceVariants = [
      {
        sourceId: original.id,
        files: ["src/data/sample.ts"],
        record: original as unknown as Raw,
      },
    ];
    mergeContent(item);
  }
  for (const q of sample.questions)
    questions.set(q.id, {
      ...structuredClone(q),
      ...sampleScope(q),
      placements: [sampleScope(q)],
      sourceVariants: [
        {
          sourceId: q.id,
          files: ["src/data/sample.ts"],
          record: q as unknown as Raw,
        },
      ],
    });
  const resolve = (id: string) => {
    const mapped = canonicalAliases[id] ?? id;
    return content.has(mapped) ? mapped : id;
  };
  const unresolved = (
    id: string,
    target: string,
    p: Mappings,
    sourceVariants: SourceVariant[],
  ) => {
    const item: ContentItem = {
      ...p,
      id,
      type: "content_reference",
      title: `${human(target)} — source reference`,
      slug: slug(id),
      formula: "",
      summary: "The referenced educational record was not supplied.",
      body: [
        {
          heading: "Pending source content",
          bullets: [
            `Expected canonical ID: ${target}`,
            "This reference contains mappings and exam notes, but no verified formula to display.",
          ],
        },
      ],
      explanation:
        "This record preserves the supplied reference without inventing missing content.",
      example: "",
      whenToUse: "",
      commonMistake: "",
      variables: [],
      units: [],
      keywords: [id, target],
      tags: ["pending-source"],
      difficulty: "medium",
      importance: 3,
      relatedIds: [],
      details: { canonical_content_id: target },
      needsReview: true,
      reviewReasons: [
        "The canonical target is absent from all supplied JSON files.",
      ],
      sourceVariants,
      placements: [p],
    };
    mergeContent(item);
    return item;
  };
  for (const [id, versions] of references) {
    for (const v of versions) {
      const r = v.record;
      const target = resolve(text(r.canonical_content_id));
      const p = placement(r, v.files);
      const existing = content.get(target);
      if (existing) {
        mergeMappings(existing, p);
        existing.placements = mergePlacements(existing.placements ?? [], [p]);
        existing.sourceVariants = [...(existing.sourceVariants ?? []), v];
        existing.importance = Math.max(
          existing.importance,
          Number(r.jee_importance) || 3,
        );
        existing.keywords = unique([
          ...existing.keywords,
          ...strings(r.keywords),
          id,
          text(r.canonical_content_id),
        ]);
        existing.tags = unique([...existing.tags, ...strings(r.tags)]);
        existing.body.push(...bodyFrom(r));
        data.contentAliases![id] = target;
        report.resolvedReferences.push({ id, target });
      } else {
        unresolved(id, text(r.canonical_content_id), p, [v]);
        report.unresolvedReferences.push({
          id,
          target: text(r.canonical_content_id),
        });
        data.contentAliases![text(r.canonical_content_id)] = id;
      }
    }
  }
  // The humanities economics file is an explicit reuse mapping, not another content copy.
  const economicsMapping = inputs.find(
    (i) =>
      text(record(i.data).canonical_source) &&
      text(record(i.data).subject) === "Economics",
  );
  if (economicsMapping) {
    const econ = entities.get("subjects:economics");
    if (econ) {
      econ.placements = mergePlacements(
        econ.placements ?? [],
        (econ.placements ?? []).map((p) => ({ ...p, streams: ["arts"] })),
      );
      econ.needsReview = true;
    }
    for (const chapter of entities.values())
      if ("subjectId" in chapter && chapter.subjectId === "economics") {
        chapter.placements = mergePlacements(
          chapter.placements ?? [],
          (chapter.placements ?? []).map((p) => ({ ...p, streams: ["arts"] })),
        );
      }
    for (const item of content.values())
      if (item.subjects.includes("economics")) {
        const arts = (item.placements ?? []).map((p) => ({
          ...p,
          streams: ["arts"],
        }));
        item.placements = mergePlacements(item.placements ?? [], arts);
        item.streams = unique([...item.streams, "arts"]);
        item.needsReview = true;
        item.reviewReasons = unique([
          ...(item.reviewReasons ?? []),
          "The supplied Humanities Economics mapping is marked for review.",
        ]);
      }
  }
  if (economicsMapping)
    for (const q of questions.values())
      if (q.subjects.includes("economics")) {
        q.placements = mergePlacements(
          q.placements ?? [],
          (q.placements ?? []).map((p) => ({ ...p, streams: ["arts"] })),
        );
        q.streams = unique([...q.streams, "arts"]);
        q.needsReview = true;
        q.reviewReasons = [
          "The supplied Humanities Economics mapping is marked for review.",
        ];
      }
  const allAliases = { ...canonicalAliases, ...data.contentAliases };
  const link = (id: string, owner: ContentItem | Question) => {
    const target = allAliases[id] ?? id;
    if (content.has(target)) return target;
    unresolved(target, target, owner.placements?.[0] ?? owner, []);
    report.unresolvedReferences.push({ id: owner.id, target });
    return target;
  };
  for (const item of [...content.values()])
    item.relatedIds = unique(
      item.relatedIds.map((id) => link(id, item)),
    ).filter((id) => id !== item.id);
  for (const q of questions.values())
    q.linkedContentIds = unique(q.linkedContentIds.map((id) => link(id, q)));
  for (const [alias, target] of Object.entries(allAliases))
    if (alias !== target && content.has(target))
      data.contentAliases![alias] = target;
  data.content = [...content.values()].sort((a, b) => a.id.localeCompare(b.id));
  data.questions = [...questions.values()].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  data.subjects = [...entities.entries()]
    .filter(([k]) => k.startsWith("subjects:"))
    .map(([, e]) => e);
  data.chapters = [...entities.entries()]
    .filter(([k]) => k.startsWith("chapters:"))
    .map(([, e]) => e) as Dataset["chapters"];
  data.topics = [...entities.entries()]
    .filter(([k]) => k.startsWith("topics:"))
    .map(([, e]) => e) as Dataset["topics"];
  data.sheets = sample.sheets.map((s) => ({
    ...structuredClone(s),
    ...sampleScope(s),
    contentIds: unique(
      s.contentIds.map((id) => data.contentAliases![id] ?? id),
    ),
  }));
  // Build sheets from existing mapped formulas; no new educational records are generated.
  for (const classEntity of data.classes)
    for (const subject of data.subjects) {
      const formulas = data.content.filter(
        (c) =>
          c.type === "formula" &&
          c.placements?.some(
            (p) =>
              p.classes.includes(classEntity.id) &&
              p.subjects.includes(subject.id),
          ),
      );
      if (!formulas.length) continue;
      const mappings = blank();
      for (const c of formulas)
        for (const p of c.placements ?? [])
          if (
            p.classes.includes(classEntity.id) &&
            p.subjects.includes(subject.id)
          )
            mergeMappings(mappings, p);
      mappings.exams = [];
      data.sheets.push({
        ...mappings,
        id: `sheet-${classEntity.id}-${subject.id}-supplied`,
        title: `${classEntity.name} ${subject.name} Formula Sheet`,
        description:
          "Formulas available in the supplied content pack; coverage may be partial.",
        contentIds: formulas.map((f) => f.id),
      });
    }
  for (const subject of data.subjects) {
    const formulas = data.content.filter(
      (c) =>
        c.type === "formula" &&
        c.placements?.some(
          (p) =>
            p.exams.includes("jee-main") && p.subjects.includes(subject.id),
        ),
    );
    if (!formulas.length) continue;
    const mappings = blank();
    for (const c of formulas)
      for (const p of c.placements ?? [])
        if (p.exams.includes("jee-main") && p.subjects.includes(subject.id))
          mergeMappings(mappings, p);
    mappings.classes = [];
    mappings.boards = [];
    mappings.streams = [];
    data.sheets.push({
      ...mappings,
      id: `sheet-jee-main-${subject.id}-supplied`,
      title: `JEE Main ${subject.name} Supplied Formula Sheet`,
      description:
        "Canonical formulas and supplied JEE additions. Not a claim of full syllabus coverage.",
      contentIds: formulas.map((f) => f.id),
    });
  }
  report.uniqueSourceRecords = variants.size + references.size;
  report.counts = {
    files: inputs.length,
    subjects: data.subjects.length,
    chapters: data.chapters.length,
    topics: data.topics.length,
    content: data.content.length,
    formulas: data.content.filter((c) => c.type === "formula").length,
    questions: data.questions.length,
    sheets: data.sheets.length,
    needsReview: data.content.filter((c) => c.needsReview).length,
  };
  for (const classEntity of data.classes)
    for (const stream of classEntity.id === "class-11" ||
    classEntity.id === "class-12"
      ? data.streams
      : [{ id: "", name: "" }])
      for (const subject of data.subjects) {
        const matches = (item: ContentItem | Question) =>
          item.placements?.some(
            (p) =>
              p.classes.includes(classEntity.id) &&
              p.subjects.includes(subject.id) &&
              (!stream.id || p.streams.includes(stream.id)),
          );
        const contentCount = data.content.filter(matches).length;
        const questionCount = data.questions.filter(matches).length;
        if (
          contentCount ||
          questionCount ||
          subject.placements?.some(
            (p) =>
              p.classes.includes(classEntity.id) &&
              (!stream.id || p.streams.includes(stream.id)),
          )
        )
          report.coverage.push({
            classId: classEntity.id,
            streamId: stream.id || undefined,
            subjectId: subject.id,
            content: contentCount,
            questions: questionCount,
          });
      }
  for (const subject of data.subjects) {
    const matches = (item: ContentItem | Question) =>
      item.placements?.some(
        (p) => p.exams.includes("jee-main") && p.subjects.includes(subject.id),
      );
    const count = data.content.filter(matches).length;
    const q = data.questions.filter(matches).length;
    if (count || q)
      report.coverage.push({
        examId: "jee-main",
        subjectId: subject.id,
        content: count,
        questions: q,
      });
  }
  report.normalizationNotes.push(
    "Original JSON files remain unchanged; every record occurrence is represented by a source variant/file association or a resolved reference.",
    "Combined/split duplicates are merged by semantic ID; original record variants remain attached.",
    "Metadata-only Science chapters are preserved but are not represented as invented content.",
    "Illustrations/maps have descriptions and labels only; no source assets were supplied.",
    "Review flags and generic starter notes remain visible as review-marked content.",
  );
  let hash = 2166136261;
  for (const character of JSON.stringify(data))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  data.fingerprint = String(hash);
  validateDataset(data);
  return { data, report };
}
