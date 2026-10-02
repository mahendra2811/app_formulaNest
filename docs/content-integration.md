# Supplied content integration

The app imports all 80 JSON files under `planning /preplexity`. Combined packs, subject splits, standalone arrays, manifests, reference mappings, source metadata and validation summaries are accounted for. Original files remain unchanged.

## Bundled result

| Category                          | Count |
| --------------------------------- | ----: |
| Source JSON files                 |    80 |
| Subjects                          |    13 |
| Chapters                          |   411 |
| Topics                            |   419 |
| Content records                   |   503 |
| Formulas (included in content)    |   103 |
| Questions                         |    70 |
| Formula sheets                    |    21 |
| Content records marked for review |    82 |

Counts include the compatible original sample. Split/combined copies are deduplicated; differing records with the same ID retain every original variant. Raw occurrence counts and per-profile coverage are in `content-import-report.json`. Every source educational occurrence is tested against its exact original record and filename.

## App integration

- All supplied content types can be opened, searched, bookmarked, revised and shared offline. Structured tables, timelines, comparisons, accounting entries, reactions and diagram/map descriptions are readable.
- School Science, Commerce and Humanities mappings are normalized to existing class/board/stream preferences. Economics is reused across relevant streams with source uncertainty marked.
- Contextual placement rows bind class, subject, chapter and exam together, preventing shared formulas from leaking another class's chapters into browsing.
- Canonical IDs unify equivalent formulas and resolve JEE references. Aliases preserve old sample routes and migrate bookmarks, recent items and revision state. Existing quiz snapshots remain untouched.
- Validation precedes transactional SQLite updates. A content fingerprint triggers updates even when the dataset version remains the same.
- `npm run content:import` reproduces the bundle and import report. Startup seeds the generated bundle, requiring no network or credentials.

## Source limitations retained

- There is no dedicated AI9 JEE Main Chemistry response in the supplied folder. The supplied Class 11/12 Chemistry records are included; missing exam coverage is not invented.
- `math_matrix_inverse` has no canonical formula record. Its reference is retained with a review/pending indication.
- Source packs are partial starter coverage. Many chapter records are short reminders; chapter metadata does not imply a complete lesson or question bank.
- Classes 6–8 Science have chapter metadata but no supplied educational records.
- No diagram/map image assets were supplied; labels and descriptions remain available with missing-illustration notices.
- `q_ps_federalism` incorrectly referenced Class 12 Geography in two source copies. Its app placement is corrected to Class 11 Political Science / Federalism and marked for review; original records remain attached unchanged.

## Verification

Normalization tests cover every supplied occurrence, deterministic output, retained types/review flags, duplicate resolution and missing references. Real SQLite tests cover full import, contextual placement, metadata-only coverage, saved-state upgrades, fingerprint updates and transaction safety. Browser journeys cover offline school/JEE use, Commerce onboarding, structured content, saved state and quiz resumption. TypeScript, ESLint, unit/integration tests, browser tests and Android/web exports are run for this integration.

Android bundle export is build evidence; physical Android execution remains unverified because no device/emulator is attached. No deployment or store publication was performed.

### Final command results

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 29 tests passed across four files.
- `npm run export:web`: passed.
- `npm run export:android`: passed (Hermes bundle).

The structured-content browser test waits for bookmark confirmation before reload, matching the asynchronous SQLite save lifecycle.

- `npm run test:e2e`: all three browser journeys passed.
