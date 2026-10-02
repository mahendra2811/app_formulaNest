# Formula Learner

An offline educational revision companion built with Expo SDK 57, React Native, strict TypeScript, Expo Router, Zustand, and expo-sqlite. The Phase 1 app now includes all supplied content JSON responses.

## Run

Use Node.js 24 (the SQLite integration tests use `node:sqlite`).

```sh
npm ci
npm start
npm run android
npm run ios
npm run web
```

`npm run android` opens an attached Android device/emulator through Expo. Use an Expo Go version that supports SDK 57, or an EAS preview APK. The preview profile builds a standalone APK with the content bundled inside; it does not require a Metro server after installation.

```sh
npm run typecheck
npm run lint
npm test
npm run validate
npx expo-doctor
npm run export:android
npm run export:web
npm run test:e2e
npm run preview:web
```

The browser acceptance suite uses Chromium (`npx playwright install chromium` if missing). Web SQLite needs WASM and cross-origin isolation headers. The local preview server supplies those headers. Web is a development/verification target; the offline installable deliverable is the native app. A web reload needs the local server; no web PWA is included.

No environment variables, accounts, API keys, or backend are required.

## Architecture

`app/` contains the five tab routes and stack routes for onboarding, settings, subjects, chapters, topics, formulas, notes, sheets, tests, and results. The root opens SQLite, runs migrations/import, and displays a retryable initialization error if opening or seeding fails.

`src/db/` owns migrations, validated transactional imports, parameterized queries, bookmarks, recent items, revision, and attempts. The UI queries SQLite through a repository and focus-aware query hook. Content stays out of Zustand. Query results are bounded, lists use FlatList, and audience mappings have lookup indexes. Search uses escaped literal matching on a searchable text projection and indexed audience/type restrictions; it has no remote search dependency.

`src/stores/preferences.ts` uses Zustand and AsyncStorage for onboarding selections, theme, and Quick Formula/Learn Mode. Hydration is awaited before the entry route chooses onboarding or home. Study data persists in SQLite independently of the selected profile. Home previews respect the active study plan; Library retains saved items across profile changes.

`src/data/generated/content.json` is the bundled content source, built from all 80 supplied JSON files; `src/data/sample.ts` preserves the original sample and compatibility records. `src/data/validate.ts` validates untrusted content before import. SQLite owns test question snapshots and answers so unfinished tests survive restart and completed results remain stable after later content updates.

## Database

- `entities`: metadata for classes, exams, boards, streams, subjects, chapters and topics; `(kind,id)` is the key. Chapters/topics have parent IDs.
- `content`, `questions`, `formula_sheets`: one record per item, with structured secondary properties in JSON.
- `mappings`: many-to-many audience, subject, chapter and topic mappings for content, questions and sheets. A single formula is reused by school and JEE.
- `bookmarks`, `recent_items`, `revision_items`: local user state; recent items are deduplicated and capped at 30. Revision supports Needs Revision and Learned.
- `test_attempts`: complete question snapshots, answers and completion status.
- `metadata`: seed version; schema migrations use `PRAGMA user_version`.

## Content import

Prepare a JSON object matching `Dataset` in `src/types/content.ts`. Its top-level fields are `version`, `classes`, `exams`, `boards`, `streams`, `subjects`, `chapters`, `topics`, `content`, `questions`, and `sheets`. Each content/question/sheet has array mappings `classes`, `exams`, `subjects`, `chapters`, `topics`, `boards`, `streams`. Reference IDs must exist. Question answers use zero-based indexes 0–3 and exactly four options. Short notes use structured section headings and bullet arrays; referenced formulas use `relatedIds`.

To rebuild the bundled pack after changing source JSON:

```sh
npm run content:import
npm run typecheck
npm test
```

The importer reads every JSON file in `planning /preplexity`, merges duplicate split/combined records, resolves canonical references, retains original record variants and metadata, and writes `docs/content-import-report.json`. Dataset version and content fingerprint trigger transactional updates on the next app startup. Schema version 2 adds contextual `placement_mappings` and `content_aliases`; old sample bookmarks, history, and revision IDs migrate to canonical IDs.

Validation completes before any deletion, and all content/mapping replacement runs in a transaction. Bookmarks, revision, recent history and attempts are preserved. Keep existing IDs stable when replacing packs. Malformed data errors include field paths. No UI changes are needed to import another dataset with the same schema.

## Phase 1 features

- School/exam onboarding, classes 6–12, board/stream architecture, subject selection, editable study plan, supported/coming-soon states.
- Personalized home, continue studying, relevant subjects, deterministic formula of the day, revision/bookmark/recent previews and formula sheets.
- Subject → chapter → topic browsing, Quick Formula and Learn modes, complete text equation details, structured short notes and linked formulas.
- Offline search with mode/class/exam/subject/chapter/type filters and literal wildcard handling.
- Persistent bookmarks, revision/learned status, capped recent history and test history.
- Quick quiz, subject/chapter practice, randomized custom 5/10/20-question tests, Easy/Medium/Hard/Mixed filters and graceful smaller sets.
- Immediate answer feedback, explanations, persisted answers, resumable tests, score/accuracy/results and linked-formula review.
- Native text sharing, formula copying, readable light/dark/system themes, missing-ID and database error states.
- Expanded pack: 503 content items (103 formulas), 70 MCQs, 13 subjects, 411 chapters, and 21 formula sheets. Includes Science, Commerce, Humanities, classes 6–12, and supplied JEE Main Mathematics/Physics data. All 80 JSON files are accounted for.
- Tables, reactions, accounting entries, comparisons, timelines, graph descriptions, diagram/map labels, and source/review information have offline reading screens.
- Source coverage is partial: metadata-only Science chapters in classes 6–8 have no fabricated lessons; missing images are labelled. No AI9 JEE Main Chemistry response was supplied. The unresolved matrix inverse reference remains flagged. See [integration evidence](docs/content-integration.md).

## Acceptance

Follow the full journey in the supplied primary prompt or run `npm run test:e2e` after the web export. Verification evidence and device limitations are recorded in `docs/phase-1-verification.md`.

## Future work — Phase 2 ideas only

Complete independently reviewed syllabus packs, LaTeX typography, image sharing, PDF export, personal notes, more boards/exams and spaced revision. These are not implemented in Phase 1.
