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

No environment variables, accounts, API keys, or backend are required to run the app. EAS cloud builds require an Expo account; store submission requires the relevant developer account.

## Android builds and releases

Run these commands from the project root:

```sh
cd /home/pooniya/Documents/p_project/a_App/8.formula_learner
```

### Account and project setup

```sh
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest project:info
```

This repository already has `eas.json` and an EAS project ID in `app.json`. For a new, unconfigured project only, use `npx eas-cli@latest init` followed by `npx eas-cli@latest build:configure`.

The Android package and iOS bundle identifier are currently `com.pooniya.formulanest` (all lowercase). The Android package must match the existing Play Console listing exactly. Changing a package ID does not transfer signing credentials.

### Before each release

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run validate
npx expo-doctor
npx expo config --type public
```

Review the resolved package ID. If releasing a new user-visible version, update `expo.version` in `app.json`. Android version codes are managed remotely by EAS: `eas.json` sets `appVersionSource: remote` and production `autoIncrement: true`.

```sh
npx eas-cli@latest build:version:get --platform android --profile production
```

### Build an APK for direct installation

```sh
npx eas-cli@latest build --platform android --profile preview
```

Download the APK from the completed build's link and install it on your Android device. This uses the existing `preview` profile and runs without a development server. With Android platform tools installed and a device connected with USB debugging enabled:

```sh
adb devices
adb install -r /path/to/app.apk
```

An installed app with the same package but a different signing key cannot be updated in place. Uninstalling it removes its local study data, so back up anything needed first.

### Build an AAB for Google Play

```sh
npx eas-cli@latest build --platform android --profile production
```

Download the `.aab` from the completed build page. Upload it to the intended track in Google Play Console. An AAB cannot be installed directly like an APK. `npm run export:android` only exports JavaScript/assets; it does not produce a signed APK or AAB.

Inspect recent builds and a specific build:

```sh
npx eas-cli@latest build:list --platform android
npx eas-cli@latest build:view BUILD_ID
```

Replace `BUILD_ID` with the ID from the build list. If troubleshooting stale build caches, rebuild with:

```sh
npx eas-cli@latest build --platform android --profile production --clear-cache
```

Clearing the cache does not fix a signing-key mismatch.

### Optional submission through EAS

The first Android upload must be made manually in Google Play Console. Subsequent EAS submissions require a Google service account configured with access to the app. This command uploads a selected build to Google Play; review the build and destination track carefully:

```sh
npx eas-cli@latest submit --platform android
```

Build and submit are separate steps. Complete the listing, testing, review, and rollout steps in Play Console as required.

### Signing credentials and upload-key recovery

```sh
npx eas-cli@latest credentials --platform android
```

Choose `production`, then `Keystore: Manage everything needed to build your project`. Use `Download existing keystore` to back up the selected key. Store its keystore password, key alias, and key password securely outside Git. Public `.der` or `.pem` certificates cannot replace the private keystore for signing builds.

Because the package spelling changed, verify the credentials shown for the current lowercase package before building. If necessary, configure it to use the downloaded keystore whose certificate was submitted for the reset; do not generate another key unintentionally.

Signing fingerprints recorded during the 2 October 2026 investigation (the reset status must be checked in Play Console):

| Certificate | SHA-1 |
| --- | --- |
| Upload key previously required by Play | `D9:AE:5F:B4:A8:09:9B:65:1C:CA:DA:46:C8:A8:1B:73:69:6C:E0:3C` |
| Downloaded EAS key used for the replacement PEM | `6B:69:03:20:C7:D7:71:7B:D5:A6:42:26:3F:4E:6A:51:C3:1F:29:81` |

If the original upload key is unavailable, request an upload-key reset in Play Console using the replacement key's public PEM certificate. The following commands require Java's `keytool`; passwords are entered interactively.

Inspect the downloaded keystore:

```sh
keytool -list -v -keystore './@mahi0092__formula-learner.jks'
```

Export the replacement upload certificate using this keystore's alias:

```sh
keytool -exportcert -rfc \
  -keystore './@mahi0092__formula-learner.jks' \
  -alias d61402f876edfbd804de1f1a66f0ed3e \
  -file "$HOME/Downloads/upload_certificate.pem"
```

Verify the PEM fingerprint:

```sh
keytool -printcert -file "$HOME/Downloads/upload_certificate.pem"
```

Upload `~/Downloads/upload_certificate.pem` through **App signing > Request upload key reset**. Only upload the public PEM certificate. Wait for Google's confirmed activation time, then upload an AAB signed with that same replacement key. A reset changes the accepted upload key, not Google's app signing key. Keep `.jks`, `.keystore`, credential JSON files, and passwords out of Git.

### Development restart and iOS build

Restart Metro with a cleared cache when troubleshooting local bundling:

```sh
npx expo start --clear
```

For an iOS production build (requires Apple signing credentials and appropriate Apple Developer access):

```sh
npx eas-cli@latest build --platform ios --profile production
```

References: [EAS Build setup](https://docs.expo.dev/build/setup/), [APK builds](https://docs.expo.dev/build-reference/apk/), [EAS CLI commands](https://docs.expo.dev/eas/cli/), [Android submission](https://docs.expo.dev/submit/android/), [Play App Signing and upload-key resets](https://support.google.com/googleplay/android-developer/answer/9842756).

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
