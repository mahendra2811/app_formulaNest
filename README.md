# Formula Nest

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

No environment variables, accounts, API keys, or backend are required to run the app. EAS cloud builds require an Expo account; store submission requires the relevant developer account.

## Fresh Android app identity

The app is now **Formula Nest**, Android package and iOS bundle ID `com.pooniya.formulanestapp`, Expo slug/scheme `formula-nest-app`, version `1.0.0`, initial Android version code `1`. The old EAS project link has been removed. The existing app features and educational content are retained.

Old local signing keystores have been permanently deleted, including the temporary backup. Generated caches/build exports were moved outside this repository to a timestamped folder under `~/.local/share/formula-nest/legacy-signing-backups/`. The new app uses fresh SQLite and preferences storage names. Old remote EAS credentials and Play listings have not been deleted. They are not linked in the new configuration. Do not import old keys into the new app.

### Create a new Expo project and new upload key

Run from this project directory:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest project:info
npx expo config --type public
npx eas-cli@latest build --platform android --profile production --clear-cache
```

During `init`, create a **new** project named `formula-nest-app`; do not select/link the previous project. It writes a new `extra.eas.projectId` into `app.json`. Verify the resolved Android package is `com.pooniya.formulanestapp`. During the first build, choose **Generate a new Android Keystore**. Do not upload or select an old keystore. EAS creates and stores a new upload key. The production profile builds an AAB with remotely managed credentials and version codes; auto-increment can make the first build code greater than 1, which is valid for a new listing.

After building, securely download a backup of the **new** keystore using:

```sh
npx eas-cli@latest credentials --platform android
```

Select production and the new package, then the keystore download option. Store the file and passwords outside Git. Never share passwords, private keys, or service-account JSON in chat.

For an installable test APK using the same new app credentials:

```sh
npx eas-cli@latest build --platform android --profile preview
```

### New Google Play listing

Create a new app in Play Console, select its name, default language, app type, pricing, and declarations. The package identity comes from the uploaded AAB; Play Console does not generate a package ID. Upload the first AAB manually to the new app's testing track, and use Google-generated app signing when enrolling in Play App Signing. This creates a separate Play app signing key; the EAS keystore is the upload key. Do not request an upload-key reset for the old listing.

Complete the dashboard requirements, store text, screenshots, icon, feature graphic, support contact, hosted privacy-policy URL, app access, ads, data safety, content rating, target audience, and any account-specific testing/verification requirements shown by Google. Review `PRIVACY_POLICY.md` and replace any placeholders before publishing it. Confirm that declarations match the shipped app and intended audience.

To continue with release preparation, provide the new EAS project ID/build URL, your chosen store name, support email, public privacy-policy URL, and the Play Console requirements or upload errors you see. No Google service account is required for a manual first upload. A new package installs separately and does not migrate the old app's local progress automatically.

Changing package/signing identity does not redesign the screens or reset any Google Play policy/account history. Store submission and rollout are separate from building.

References: [EAS build setup](https://docs.expo.dev/build/setup/), [EAS managed signing credentials](https://docs.expo.dev/app-signing/managed-credentials/), [Create a Play app](https://support.google.com/googleplay/android-developer/answer/9859152), [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756).

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

Done—the local app identity is reset:

- Package ID: **`com.pooniya.formulanestapp`**
- App name: **Formula Nest**
- Deleted all three old local signing keys and their temporary backups.
- Removed the old Expo project link.
- Updated the slug, deep-link scheme, and local storage names.
- TypeScript and lint checks passed.

**New signing keys haven’t been generated yet.** Old credentials on Expo’s servers and the old Play listing haven’t been deleted.

Run these commands from the project folder:

```
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile production --clear-cache
```

Choose **Create a new project** during initialization and **Generate a new Android Keystore** during the build. [Expo signing instructions](https://docs.expo.dev/app-signing/managed-credentials/).

Create a **new app listing** in Play Console, then upload the resulting AAB. Its package ID comes from the AAB. [Play Console setup](https://support.google.com/googleplay/android-developer/answer/9859152).

Send me the new Expo project ID/build URL and any Play Console requirements or errors. Keep private keys and passwords out of chat.
